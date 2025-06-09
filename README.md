
# Interactive Quiz Kit

## Giới thiệu

**Interactive Quiz Kit** là một thư viện JavaScript/TypeScript được xây dựng với React, được thiết kế để dễ dàng tạo, quản lý và chơi các bài quiz tương tác. Thư viện này hỗ trợ nhiều loại câu hỏi đa dạng, cho phép nhập/xuất dữ liệu quiz dưới dạng JSON, và được xây dựng với mục tiêu dễ dàng mở rộng. Nó cũng hỗ trợ gửi kết quả quiz đến một webhook được định sẵn và tích hợp với các Hệ thống Quản lý Học tập (LMS) thông qua SCORM. Thư viện còn cung cấp các phân tích chi tiết về thời gian làm bài, cho phép bổ sung thông tin ngữ cảnh phong phú cho từng câu hỏi, và nay đã có tính năng tạo câu hỏi bằng AI (sử dụng Gemini).

## Tính năng chính

### 1. Logic Lõi (`QuizEngine`)
- **Xử lý câu hỏi:** Quản lý trạng thái câu hỏi hiện tại, điều hướng.
- **Xáo trộn:** Hỗ trợ xáo trộn thứ tự câu hỏi và thứ tự các lựa chọn trong câu hỏi trắc nghiệm/ghép nối.
- **Chấm điểm:** Tự động chấm điểm dựa trên đáp án của người dùng và đáp án đúng được định nghĩa.
- **Tính toán kết quả:** Tổng hợp điểm số, tính phần trăm, xác định trạng thái qua/không qua (nếu có điểm sàn).
- **Phân tích thời gian:** Theo dõi thời gian làm bài cho từng câu hỏi và toàn bộ bài quiz.
- **SCORM Integration:** Hoạt động cùng với `SCORMService` để báo cáo điểm số, trạng thái hoàn thành và thời gian cho các LMS tương thích SCORM 1.2 và SCORM 2004.
- **Webhook Submission:** Gửi kết quả quiz chi tiết đến một URL webhook được cấu hình.
- **Callbacks:** Cung cấp callbacks cho các sự kiện quan trọng trong quá trình làm quiz (bắt đầu, thay đổi câu hỏi, nộp bài, kết thúc, hết giờ).

### 2. Thành phần Giao diện Người dùng React (`components/`)
- **`QuizPlayer`:** Thành phần chính để hiển thị và tương tác với bài quiz.
- **`QuestionRenderer`:** Hiển thị câu hỏi hiện tại dựa trên loại câu hỏi.
- **Giao diện cho từng loại câu hỏi:**
    - `MultipleChoiceQuestionUI`
    - `MultipleResponseQuestionUI`
    - `FillInTheBlanksQuestionUI`
    - `DragAndDropQuestionUI`
    - `TrueFalseQuestionUI`
    - `ShortAnswerQuestionUI`
    - `NumericQuestionUI`
    - `SequenceQuestionUI`
    - `MatchingQuestionUI`
    - `HotspotQuestionUI`
    - `BlocklyProgrammingQuestionUI`
    - `ScratchProgrammingQuestionUI`
- **`QuizResult`:** Hiển thị kết quả chi tiết sau khi hoàn thành quiz, bao gồm phân tích hiệu suất.
- **`QuizDataManagement`:** Cho phép nhập quiz từ file JSON và xuất quiz hiện tại ra file JSON.
- **Công cụ Tạo Quiz (`QuizAuthoringTool` và các thành phần con):**
    - Giao diện trực quan để tạo và chỉnh sửa các quiz.
    - Cho phép định nghĩa tiêu đề, mô tả, và các cài đặt chung cho quiz.
    - Thêm, sửa, xóa, và sắp xếp lại thứ tự các câu hỏi.
    - **Thành phần Form Câu hỏi Chuyên biệt (ví dụ: `TrueFalseQuestionForm`, `MultipleChoiceQuestionForm`):** Được sử dụng bên trong `EditQuestionModal` để cung cấp giao diện nhập liệu cho từng loại câu hỏi. Các form này cho phép nhập đầy đủ các trường metadata như `learningObjective`, `difficulty`, `topic`, `glossary`, v.v.
    - Hỗ trợ tạo tất cả các loại câu hỏi được định nghĩa.
- **Thành phần dùng chung:** `Button`, `Card` cho giao diện nhất quán.

### 3. Các loại câu hỏi được hỗ trợ (`types.ts`)
1.  **Multiple Choice (Trắc nghiệm - một đáp án đúng):** Người dùng chọn một đáp án từ danh sách.
2.  **Multiple Response (Trắc nghiệm - nhiều đáp án đúng):** Người dùng chọn một hoặc nhiều đáp án đúng.
3.  **Fill In The Blanks (Điền vào chỗ trống):** Người dùng điền từ/cụm từ vào các ô trống trong một câu.
4.  **Drag and Drop (Kéo thả):** Người dùng kéo các mục vào các vùng thả tương ứng.
5.  **True/False (Đúng/Sai):** Người dùng chọn Đúng hoặc Sai cho một nhận định.
6.  **Short Answer (Trả lời ngắn):** Người dùng nhập một câu trả lời ngắn bằng văn bản.
7.  **Numeric (Trả lời bằng số):** Người dùng nhập một câu trả lời bằng số, có hỗ trợ khoảng dung sai.
8.  **Sequence (Sắp xếp thứ tự):** Người dùng sắp xếp các mục theo đúng thứ tự.
9.  **Matching (Ghép nối):** Người dùng ghép các mục ở cột A với các mục tương ứng ở cột B.
10. **Hotspot (Điểm nóng):** Người dùng nhấp vào một hoặc nhiều vùng cụ thể trên một hình ảnh.
11. **Blockly Programming (Lập trình Blockly):** Người dùng giải quyết một vấn đề bằng cách lắp ráp các khối lệnh Blockly.
12. **Scratch Programming (Lập trình Scratch):** Người dùng giải quyết một vấn đề bằng cách sử dụng các khối lệnh kiểu Scratch (dựa trên Blockly).

### 4. Quản lý Dữ liệu Quiz
- **Định nghĩa kiểu TypeScript:** Cung cấp các interface rõ ràng cho cấu trúc quiz và các loại câu hỏi.
- **Nhập/Xuất JSON:** Dễ dàng lưu và tải các bài quiz dưới dạng file JSON.
- **SCORM Packaging:**
    - **`SCORMManifestGenerator.ts`:** Tạo file `imsmanifest.xml` cần thiết cho gói SCORM.
    - **`HTMLLauncherGenerator.ts`:** Tạo file HTML launcher để chạy quiz bên trong LMS.
    - Hỗ trợ xuất gói SCORM dưới dạng ZIP (yêu cầu người dùng tự thêm file bundle JS của thư viện vào thư mục `lib/` trong file ZIP).
    - Gói SCORM được tạo ra bao gồm HTML cần thiết, dữ liệu quiz, và một tham chiếu đến `blockly-styles.css` (cần có sẵn để các câu hỏi Blockly/Scratch hiển thị đúng).

### 5. Metadata Câu hỏi Phong phú
Mỗi câu hỏi có thể được bổ sung các metadata sau:
- `learningObjective`: Mục tiêu học tập.
- `glossary`: Danh sách các thuật ngữ liên quan.
- `bloomLevel`: Cấp độ theo thang Bloom (ví dụ: Remembering, Applying).
- `difficulty`: Độ khó (easy, medium, hard, hoặc tùy chỉnh).
- `category`: Chủ đề lớn (ví dụ: Mathematics, History).
- `topic`: Chủ đề cụ thể trong category.
- `gradeBand`: Khối lớp (ví dụ: K-2, Middle School).
- `contextCode`: Mã ngữ cảnh riêng cho câu hỏi.
- `course`: Tên khóa học liên quan.

### 6. Tạo Câu hỏi bằng AI (Gemini)
- **Tích hợp Gemini API:** Sử dụng mô hình `gemini-2.5-flash-preview-04-17` để tạo câu hỏi.
- **Giao diện người dùng:**
    - Nút "✨ Generate with AI" trong công cụ tạo quiz.
    - Modal `AIQuestionGeneratorModal` cho phép người dùng nhập:
        - Chủ đề/Bối cảnh cho câu hỏi.
        - Loại câu hỏi (hiện tại hỗ trợ tốt nhất cho "True/False").
        - Độ khó (Easy, Medium, Hard).
- **Quy trình:**
    1. Người dùng cung cấp thông tin đầu vào.
    2. `AIGenerationService` gửi yêu cầu đến Gemini API, yêu cầu phản hồi dưới dạng JSON theo cấu trúc định sẵn.
    3. Dịch vụ xử lý phản hồi, xác thực và chuyển đổi thành đối tượng `QuizQuestion`.
    4. Câu hỏi được tạo bởi AI sẽ được mở trong `EditQuestionModal` để người dùng xem lại, chỉnh sửa (bao gồm tất cả metadata) và lưu.
- **Xử lý lỗi:** Thông báo lỗi cho người dùng nếu quá trình tạo AI gặp sự cố.
- **API Key:** Dịch vụ AI yêu cầu API key của Gemini được cấu hình trong biến môi trường `process.env.API_KEY`.

## Cài đặt

```bash
# (Nếu bạn đã publish thư viện lên npm)
# npm install interactive-quiz-kit
# yarn add interactive-quiz-kit

# (Đối với phát triển local, sau khi clone repository)
npm install
npm run build
# Sau đó, trong project ví dụ của bạn hoặc project khác, bạn có thể dùng npm link:
# cd path/to/interactive-quiz-kit
# npm link
# cd path/to/your-project
# npm link interactive-quiz-kit
```

## Sử dụng Cơ bản (Trong một project React)

```tsx
import React, { useState } from 'react';
import { QuizPlayer, QuizConfig, QuizResult, QuizDataManagement /*, sampleQuiz (nếu được export) */ } from 'interactive-quiz-kit';
// Nếu sampleQuiz không được export, bạn có thể import trực tiếp từ source của thư viện (trong quá trình phát triển)
// import { sampleQuiz } from 'interactive-quiz-kit/src/services/sampleQuiz';


// Một ví dụ về cấu hình quiz (hoặc tải từ JSON)
const myQuiz: QuizConfig = {
  id: "my-first-quiz",
  title: "My First Interactive Quiz",
  questions: [
    // ... (Thêm các câu hỏi của bạn ở đây theo định dạng QuizQuestion)
  ],
  settings: {
    shuffleQuestions: true,
    showCorrectAnswers: 'end_of_quiz',
    passingScorePercent: 60,
    webhookUrl: "YOUR_WEBHOOK_URL_HERE" // Optional
  }
};

const App = () => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizConfig | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const handleQuizLoad = (quizData: QuizConfig) => {
    setCurrentQuiz(quizData);
    setQuizResult(null); // Reset kết quả khi tải quiz mới
  };

  const handleQuizComplete = (result: QuizResult) => {
    console.log("Quiz Complete!", result);
    setQuizResult(result);
    // QuizPlayer đã hiển thị kết quả chi tiết,
    // bạn có thể thực hiện thêm hành động ở đây (ví dụ: lưu kết quả vào backend của bạn)
  };
  
  const handleExitQuiz = () => {
    setCurrentQuiz(null);
    setQuizResult(null);
    // Chuyển về màn hình chính hoặc thực hiện hành động khác
  };

  if (!currentQuiz) {
    return (
      <div>
        <h1>Welcome to the Quiz App</h1>
        <button onClick={() => handleQuizLoad(myQuiz)}>Load My Quiz</button>
        {/* Hoặc dùng QuizDataManagement để tải từ JSON */}
        <QuizDataManagement onQuizLoad={handleQuizLoad} currentQuiz={null} />
      </div>
    );
  }

  return (
    <QuizPlayer
      quizConfig={currentQuiz}
      onQuizComplete={handleQuizComplete}
      onExitQuiz={handleExitQuiz}
    />
  );
};

export default App;
```

## Công cụ Tạo Quiz (`QuizAuthoringTool`)

Thư viện này bao gồm một `QuizAuthoringTool` mạnh mẽ cho phép tạo và chỉnh sửa các bài quiz một cách trực quan.

**Cách sử dụng:**

```tsx
import React, { useState } from 'react';
import { QuizAuthoringTool, QuizConfig, Button } from 'interactive-quiz-kit';

const AuthoringApp = () => {
  const [authoringQuiz, setAuthoringQuiz] = useState<QuizConfig | null>(null);
  const [view, setView] = useState<'menu' | 'authoring'>('menu');

  const handleStartNewQuiz = () => {
    setAuthoringQuiz(null); // Bắt đầu với quiz trống
    setView('authoring');
  };

  const handleEditQuiz = (quizToEdit: QuizConfig) => {
    setAuthoringQuiz(quizToEdit);
    setView('authoring');
  };

  const handleSaveAuthoredQuiz = (savedQuiz: QuizConfig) => {
    console.log("Quiz Saved:", savedQuiz);
    // Lưu quiz này (ví dụ: vào localStorage, backend, hoặc state của ứng dụng)
    // setMyQuizzes([...myQuizzes, savedQuiz]);
    setView('menu');
  };
  
  const handleExitAuthoring = () => {
    setView('menu');
  }

  if (view === 'authoring') {
    return (
      <QuizAuthoringTool
        initialQuizConfig={authoringQuiz}
        onSaveQuiz={handleSaveAuthoredQuiz}
        onExitAuthoring={handleExitAuthoring}
      />
    );
  }

  return (
    <div>
      <h1>Quiz Management</h1>
      <Button onClick={handleStartNewQuiz}>Create New Quiz</Button>
      {/* Giả sử bạn có một danh sách các quiz đã lưu để chọn và sửa */}
      {/* mySavedQuizzes.map(q => <Button onClick={() => handleEditQuiz(q)}>Edit {q.title}</Button>) */}
    </div>
  );
};
```

**Các tính năng của Công cụ Tạo Quiz:**
- **Chỉnh sửa Cài đặt Quiz:** Tiêu đề, mô tả, xáo trộn câu hỏi, giới hạn thời gian, điểm đỗ, URL webhook.
- **Quản lý Câu hỏi:**
    - Thêm câu hỏi mới từ danh sách các loại được hỗ trợ.
    - Chỉnh sửa câu hỏi hiện có, bao gồm prompt, điểm, lựa chọn, đáp án đúng, và tất cả metadata (learning objective, difficulty, topic, v.v.).
    - Xóa câu hỏi.
    - Sắp xếp lại thứ tự câu hỏi (ví dụ: bằng cách kéo thả trong danh sách).
- **Tạo Câu hỏi bằng AI:**
    - Sử dụng nút "✨ Generate with AI" để mở modal tạo câu hỏi.
    - Nhập chủ đề, chọn loại câu hỏi (hiện tại là True/False), và độ khó.
    - Câu hỏi do AI tạo ra sẽ được đưa vào modal chỉnh sửa để bạn xem xét và tinh chỉnh trước khi lưu.
    - Yêu cầu API key của Gemini được cấu hình trong `process.env.API_KEY`.
- **Giao diện Trực quan:** Các form được thiết kế riêng cho từng loại câu hỏi, giúp việc nhập liệu dễ dàng và chính xác.

## Schemas JSON

Các schema JSON cho `QuizConfig` và từng loại câu hỏi được cung cấp trong thư mục `src/schemas/`. Các schema này có thể được sử dụng để validate dữ liệu quiz hoặc để tự động tạo form.

## Đóng góp

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

MIT
