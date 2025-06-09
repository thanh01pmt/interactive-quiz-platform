
import { SCORMSettings } from '../types';

const SCORM_TRUE = 'true';
const SCORM_FALSE = 'false';
const SCORM_NO_ERROR = '0';

// SCORM 1.2 CMI States
const CMI_CORE_LESSON_STATUS_PASSED = "passed";
const CMI_CORE_LESSON_STATUS_FAILED = "failed";
const CMI_CORE_LESSON_STATUS_COMPLETED = "completed";
const CMI_CORE_LESSON_STATUS_INCOMPLETE = "incomplete";
const CMI_CORE_LESSON_STATUS_BROWSED = "browsed";
const CMI_CORE_LESSON_STATUS_NOT_ATTEMPTED = "not attempted";

// SCORM 2004 CMI States
const CMI_COMPLETION_STATUS_COMPLETED = "completed";
const CMI_COMPLETION_STATUS_INCOMPLETE = "incomplete";
// const CMI_COMPLETION_STATUS_NOT_ATTEMPTED = "not attempted";
// const CMI_COMPLETION_STATUS_UNKNOWN = "unknown";

const CMI_SUCCESS_STATUS_PASSED = "passed";
const CMI_SUCCESS_STATUS_FAILED = "failed";
// const CMI_SUCCESS_STATUS_UNKNOWN = "unknown";


export class SCORMService {
  private scormAPI: any = null;
  private scormVersionFound: "1.2" | "2004" | null = null;
  private settings: SCORMSettings;
  private isInitialized: boolean = false;
  private isTerminated: boolean = false;
  public studentName: string | null = null;

  constructor(settings: SCORMSettings) {
    this.settings = { 
        version: "1.2",
        setCompletionOnFinish: true,
        setSuccessOnPass: true,
        autoCommit: true,
        ...settings 
    };
    this._findAPI();
  }

  private _findAPIRecursive(win: Window): any {
    if (win === null) return null;
    // SCORM 2004
    if ((win as any).API_1484_11) {
      this.scormVersionFound = "2004";
      return (win as any).API_1484_11;
    }
    // SCORM 1.2
    if ((win as any).API) {
      this.scormVersionFound = "1.2";
      return (win as any).API;
    }
    if (win.parent && win.parent !== win) {
      return this._findAPIRecursive(win.parent);
    }
    if (win.opener && typeof win.opener !== 'undefined' && win.opener !== win) {
       return this._findAPIRecursive(win.opener);
    }
    return null;
  }

  private _findAPI(): void {
    try {
        this.scormAPI = this._findAPIRecursive(window);
        if (this.scormAPI) {
            if (!this.scormVersionFound) this.scormVersionFound = this.settings.version; 
        } else {
            console.warn("SCORMService: SCORM API not found.");
        }
    } catch(e) {
        console.error("SCORMService: Error finding SCORM API", e);
        this.scormAPI = null;
    }
  }

  public hasAPI(): boolean {
    return this.scormAPI !== null;
  }
  
  public getSCORMVersion(): "1.2" | "2004" | null {
    return this.scormVersionFound;
  }

  public initialize(): { success: boolean; error?: string; studentName?: string } {
    if (!this.hasAPI()) return { success: false, error: "SCORM API not found." };
    if (this.isInitialized) return { success: true, studentName: this.studentName || undefined };

    const result = this.scormVersionFound === "2004" ? this.scormAPI.Initialize("") : this.scormAPI.LMSInitialize("");
    
    if (result.toString() === SCORM_TRUE || result === true) { 
      this.isInitialized = true;
      const studentNameVar = this.settings.studentNameVar || (this.scormVersionFound === "2004" ? "cmi.learner_name" : "cmi.core.student_name");
      this.studentName = this.getValue(studentNameVar);
      
      if (this.scormVersionFound === "2004") {
        const completionStatusVar = this.settings.completionStatusVar_2004 || this.settings.lessonStatusVar || "cmi.completion_status";
        if (this.getValue(completionStatusVar) === "not attempted") { 
            this.setValue(completionStatusVar, CMI_COMPLETION_STATUS_INCOMPLETE);
        }
      } else { 
        const lessonStatusVar = this.settings.lessonStatusVar_1_2 || this.settings.lessonStatusVar || "cmi.core.lesson_status";
        if (this.getValue(lessonStatusVar) === CMI_CORE_LESSON_STATUS_NOT_ATTEMPTED) {
            this.setValue(lessonStatusVar, CMI_CORE_LESSON_STATUS_INCOMPLETE);
        }
      }
      if (this.settings.autoCommit) this.commit();
      return { success: true, studentName: this.studentName || undefined };
    } else {
      const error = this.getLastError();
      return { success: false, error: `Initialization failed: ${error.message}` };
    }
  }

  public terminate(): { success: boolean; error?: string } {
    if (!this.hasAPI() || !this.isInitialized || this.isTerminated) {
      const reason = !this.hasAPI() ? "API not found" : !this.isInitialized ? "Not initialized" : "Already terminated";
      return { success: !this.hasAPI() || this.isTerminated, error: this.isTerminated ? undefined : reason };
    }
    
    const result = this.scormVersionFound === "2004" ? this.scormAPI.Terminate("") : this.scormAPI.LMSFinish("");
    if (result.toString() === SCORM_TRUE || result === true) {
      this.isTerminated = true;
      this.isInitialized = false; 
      return { success: true };
    } else {
      const error = this.getLastError();
      return { success: false, error: `Termination failed: ${error.message}` };
    }
  }

  public setValue(element: string, value: string | number | boolean): { success: boolean; error?: string } {
    if (!this.hasAPI() || !this.isInitialized) {
      return { success: false, error: !this.hasAPI() ? "SCORM API not found." : "SCORM not initialized." };
    }
    const valStr = value.toString();
    const result = this.scormVersionFound === "2004" ? this.scormAPI.SetValue(element, valStr) : this.scormAPI.LMSSetValue(element, valStr);
    
    if (result.toString() === SCORM_TRUE || result === true) {
      if (this.settings.autoCommit) this.commit();
      return { success: true };
    } else {
      const error = this.getLastError();
      return { success: false, error: `SetValue failed for ${element}: ${error.message}` };
    }
  }

  public getValue(element: string): string | null {
    if (!this.hasAPI() || !this.isInitialized) return null;
    const value = this.scormVersionFound === "2004" ? this.scormAPI.GetValue(element) : this.scormAPI.LMSGetValue(element);
    const error = this.getLastError(); 
    if (error.code !== SCORM_NO_ERROR) {
      console.warn(`SCORMService: GetValue for ${element} produced an error: ${error.message}. Returning raw value:`, value);
    }
    return value?.toString() ?? null;
  }

  public commit(): { success: boolean; error?: string } {
    if (!this.hasAPI() || !this.isInitialized) {
      return { success: false, error: !this.hasAPI() ? "SCORM API not found." : "SCORM not initialized." };
    }
    const result = this.scormVersionFound === "2004" ? this.scormAPI.Commit("") : this.scormAPI.LMSCommit("");
    if (result.toString() === SCORM_TRUE || result === true) {
      return { success: true };
    } else {
      const error = this.getLastError();
      return { success: false, error: `Commit failed: ${error.message}` };
    }
  }

  public setScore(rawScore: number, maxScore: number, minScore: number = 0): void {
    if (!this.hasAPI() || !this.isInitialized) return;

    if (this.scormVersionFound === "2004") {
        const scoreRawVar = this.settings.scoreRawVar_2004 || this.settings.scoreRawVar || "cmi.score.raw";
        const scoreMaxVar = this.settings.scoreMaxVar_2004 || this.settings.scoreMaxVar || "cmi.score.max";
        const scoreMinVar = this.settings.scoreMinVar_2004 || this.settings.scoreMinVar || "cmi.score.min";
        const scoreScaledVar = this.settings.scoreScaledVar_2004 || "cmi.score.scaled";

        this.setValue(scoreMinVar, minScore);
        this.setValue(scoreMaxVar, maxScore);
        this.setValue(scoreRawVar, rawScore);
        if (maxScore > minScore) { 
            const scaledScore = (rawScore - minScore) / (maxScore - minScore);
            this.setValue(scoreScaledVar, parseFloat(scaledScore.toFixed(4)));
        }
    } else { 
        const scoreRawVar = this.settings.scoreRawVar_1_2 || this.settings.scoreRawVar || "cmi.core.score.raw";
        const scoreMaxVar = this.settings.scoreMaxVar_1_2 || this.settings.scoreMaxVar || "cmi.core.score.max";
        const scoreMinVar = this.settings.scoreMinVar_1_2 || this.settings.scoreMinVar || "cmi.core.score.min";
        
        this.setValue(scoreMinVar, minScore);
        this.setValue(scoreMaxVar, maxScore);
        this.setValue(scoreRawVar, rawScore);
    }
  }

  public setLessonStatus(status: 'passed' | 'failed' | 'completed' | 'incomplete' | 'browsed', passed?: boolean): void {
    if (!this.hasAPI() || !this.isInitialized) return;
    
    if (this.scormVersionFound === "2004") {
        const completionStatusVar = this.settings.completionStatusVar_2004 || this.settings.lessonStatusVar || "cmi.completion_status";
        const successStatusVar = this.settings.successStatusVar_2004 || "cmi.success_status";

        if (this.settings.setCompletionOnFinish && (status === "completed" || status === "passed" || status === "failed")) {
            this.setValue(completionStatusVar, CMI_COMPLETION_STATUS_COMPLETED);
        } else if (status === "incomplete" || status === "browsed") {
             this.setValue(completionStatusVar, CMI_COMPLETION_STATUS_INCOMPLETE);
        }

        if (this.settings.setSuccessOnPass && passed !== undefined) {
            this.setValue(successStatusVar, passed ? CMI_SUCCESS_STATUS_PASSED : CMI_SUCCESS_STATUS_FAILED);
        }

    } else { 
        const lessonStatusVar = this.settings.lessonStatusVar_1_2 || this.settings.lessonStatusVar || "cmi.core.lesson_status";
        let finalStatus = status;

        if (status === "completed" && this.settings.setSuccessOnPass && passed !== undefined) {
            finalStatus = passed ? CMI_CORE_LESSON_STATUS_PASSED : CMI_CORE_LESSON_STATUS_FAILED;
        } else if (status === "passed" || status === "failed") {
            // Already specific enough
        } else {
             finalStatus = CMI_CORE_LESSON_STATUS_COMPLETED; 
        }
        
        if (this.settings.setCompletionOnFinish || status === "passed" || status === "failed") {
             this.setValue(lessonStatusVar, finalStatus);
        } else if (status === CMI_CORE_LESSON_STATUS_INCOMPLETE || status === CMI_CORE_LESSON_STATUS_BROWSED) {
            this.setValue(lessonStatusVar, status);
        }
    }
  }

  public getLastError(): { code: string; message: string; diagnostic?: string } {
    if (!this.hasAPI()) return { code: "-1", message: "SCORM API not found." };
    
    const errorCode = this.scormVersionFound === "2004" ? this.scormAPI.GetLastError() : this.scormAPI.LMSGetLastError();
    if (errorCode === SCORM_NO_ERROR || errorCode === 0 || errorCode === "0") { 
      return { code: SCORM_NO_ERROR, message: "No error." };
    }
    const errorMessage = this.scormVersionFound === "2004" ? this.scormAPI.GetErrorString(errorCode) : this.scormAPI.LMSGetErrorString(errorCode);
    const diagnostic = this.scormVersionFound === "2004" ? this.scormAPI.GetDiagnostic(errorCode) : this.scormAPI.LMSGetDiagnostic(errorCode);
    
    return {
      code: errorCode.toString(),
      message: errorMessage?.toString() ?? "Unknown error.",
      diagnostic: diagnostic?.toString() ?? undefined
    };
  }
  
  public formatCMITime(totalSeconds: number): string {
    if (this.scormVersionFound === "2004") {
      // SCORM 2004 PThHmMsS format
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      let timeString = "PT";
      if (hours > 0) timeString += `${hours}H`;
      if (minutes > 0 || (hours > 0 && seconds === 0)) timeString += `${minutes}M`; // Add M if H is present and S is 0
      if (seconds > 0 || (hours === 0 && minutes === 0)) { // Always show seconds if no H or M, or if seconds > 0
        timeString += `${seconds.toFixed(2)}S`; // SCORM 2004 allows up to 2 decimal places for seconds
      }
      if (timeString === "PT") timeString = "PT0S"; // if totalSeconds is 0
      return timeString;
    } else {
      // SCORM 1.2 HHHH:MM:SS.SS
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toFixed(2).padStart(5, '0')}`;
    }
  }
}
