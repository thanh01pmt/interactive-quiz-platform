
import { QuizConfig } from '../types'; // Corrected path

// Helper function to escape XML characters
const escapeXml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') {
    return '';
  }
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const generateIMSManifestXML = (
  quizConfig: QuizConfig,
  libraryJSPath: string = 'lib/interactive-quiz-kit.esm.js', // Default path in package
  quizDataPath: string = 'quiz_data.json',
  launcherPath: string = 'quiz_launcher.html',
  blocklyCSSPath: string = 'blockly-styles.css'
): string => {
  const quizTitle = escapeXml(quizConfig.title);
  const quizIdentifier = escapeXml(quizConfig.id || `quiz_${Date.now()}`);
  const organizationIdentifier = `ORG-${quizIdentifier}`;
  const itemIdentifier = `ITEM-${quizIdentifier}`;
  const resourceIdentifier = `RES-${quizIdentifier}`;

  const scormVersionSetting = quizConfig.settings?.scorm?.version || "1.2"; // Default to 1.2
  let scormSchemaVersion = "1.2";
  let imsssNamespace = ""; // Not used by default for 1.2

  if (scormVersionSetting === "2004") {
    scormSchemaVersion = "2004 4th Edition"; // Or other editions like "2004 3rd Edition"
    imsssNamespace = `xmlns:imsss="http://www.imsglobal.org/xsd/imsss"`;
  }
  
  const scormType = "sco"; 

  // List of all files to be included in the manifest's resource section
  const fileList = [
    launcherPath,
    quizDataPath,
    libraryJSPath,
    blocklyCSSPath,
  ];

  const filesXML = fileList.map(file => `      <file href="${escapeXml(file)}" />`).join('\\n');

  const manifestXML = `<?xml version="1.0" standalone="no"?>
<manifest identifier="${quizIdentifier}_MANIFEST" version="1.1"
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
          ${imsssNamespace} 
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
                              http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd
                              ${scormVersionSetting === "2004" ? "http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd" : ""}">

  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>${scormSchemaVersion}</schemaversion>
    <!-- Optional: <adlcp:location>metadata.xml</adlcp:location> -->
  </metadata>

  <organizations default="${organizationIdentifier}">
    <organization identifier="${organizationIdentifier}" structure="hierarchical">
      <title>${quizTitle}</title>
      <item identifier="${itemIdentifier}" identifierref="${resourceIdentifier}" isvisible="true">
        <title>${quizTitle}</title>
        ${scormVersionSetting === "2004"
          ? `<imsss:sequencing><imsss:controlMode choice="true" flow="true"/></imsss:sequencing>`
          : `<adlcp:dataFromLMS/>`
        }
        ${scormVersionSetting === "1.2" && quizConfig.settings?.passingScorePercent !== undefined 
          ? `<adlcp:masteryscore>${quizConfig.settings.passingScorePercent}</adlcp:masteryscore>` 
          : ''
        }
        ${scormVersionSetting === "2004" && quizConfig.settings?.passingScorePercent !== undefined
          ? `<imsss:sequencing>
               <imsss:objectives>
                 <imsss:primaryObjective satisfiedByMeasure="true" objectiveID="PRIMARYOBJ">
                   <imsss:minNormalizedMeasure>${(quizConfig.settings.passingScorePercent / 100).toFixed(2)}</imsss:minNormalizedMeasure>
                 </imsss:primaryObjective>
               </imsss:objectives>
             </imsss:sequencing>`
          : ''
        }
      </item>
    </organization>
  </organizations>

  <resources>
    <resource identifier="${resourceIdentifier}" type="webcontent"
              adlcp:scormtype="${scormType}" href="${escapeXml(launcherPath)}">
${filesXML}
    </resource>
  </resources>
</manifest>`;

  return manifestXML;
};