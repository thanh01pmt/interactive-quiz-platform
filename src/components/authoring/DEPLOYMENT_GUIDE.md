
# Hướng dẫn Triển khai và Phát hành Thư viện Interactive Quiz Kit

Tài liệu này cung cấp hướng dẫn từng bước về cách thiết lập môi trường phát triển, tùy chỉnh, build và phát hành thư viện `interactive-quiz-kit` lên NPM.

## Mục lục

1.  [Thiết lập Môi trường Phát triển](#1-thiết-lập-môi-trường-phát-triển)
2.  [Tùy chỉnh và Mở rộng Thư viện](#2-tùy-chỉnh-và-mở-rộng-thư-viện)
    *   [Chỉnh sửa Loại Câu hỏi Hiện có](#chỉnh-sửa-loại-câu-hỏi-hiện-có)
    *   [Thêm Loại Câu hỏi Mới](#thêm-loại-câu-hỏi-mới)
    *   [Tùy chỉnh Giao diện (Styling)](#tùy-chỉnh-giao-diện-styling)
    *   [Cấu hình SCORM](#cấu-hình-scorm)
    *   [Tạo Câu hỏi bằng AI (Gemini)](#tạo-câu-hỏi-bằng-ai-gemini)
3.  [Build Thư viện](#3-build-thư-viện)
4.  [Kiểm thử (Testing)](#4-kiểm-thử-testing)
5.  [Phát hành lên NPM](#5-phát-hành-lên-npm)
6.  [Sử dụng Thư viện trong Dự án Khác](#6-sử-dụng-thư-viện-trong-dự-án-khác)

---

## 1. Thiết lập Môi trường Phát triển

Để bắt đầu phát triển hoặc tùy chỉnh thư viện:

1.  **Clone Repository:**
    ```bash
    git clone https://github.com/your-username/interactive-quiz-kit.git # Thay your-username
    cd interactive-quiz-kit
    ```

2.  **Cài đặt Dependencies:**
    Thư viện sử dụng `npm` làm trình quản lý gói.
    ```bash
    npm install
    ```
    Thao tác này sẽ cài đặt tất cả các dependencies cần thiết được liệt kê trong `package.json`.

3.  **Chạy Ứng dụng Ví dụ (Example App):**
    Thư viện đi kèm với một ứng dụng ví dụ trong thư mục `example/` để trình bày cách sử dụng và thử nghiệm các tính năng.
    ```bash
    npm run start:example
    ```
    Lệnh này sẽ khởi động ứng dụng ví dụ (thường trên cổng `3001` hoặc một cổng khác nếu được cấu hình trong `example/vite.config.js`).

4.  **Cấu trúc Dự án Chính:**
    *   `src/`: Chứa toàn bộ mã nguồn của thư viện.
        *   `components/`: Các thành phần React UI (player, renderer, authoring tools, specific question UIs).
        *   `services/`: Logic cốt lõi (`QuizEngine.ts`), dịch vụ SCORM, dịch vụ AI.
        *   `types.ts`: Định nghĩa các kiểu TypeScript cho cấu trúc dữ liệu quiz.
        *   `schemas/`: JSON Schemas cho việc validate cấu trúc quiz.
        *   `samples/`: Các file JSON mẫu cho từng loại câu hỏi.
        *   `utils/`: Các hàm tiện ích.
        *   `index.ts`: File đầu vào chính của thư viện, export các thành phần và kiểu cần thiết.
    *   `example/`: Ứng dụng React mẫu sử dụng thư viện.
    *   `dist/`: Thư mục chứa output sau khi build thư viện.
    *   `rollup.config.js`: Cấu hình Rollup để build thư viện.
    *   `package.json`: Thông tin về thư viện, scripts, dependencies.

---

## 2. Tùy chỉnh và Mở rộng Thư viện

### Chỉnh sửa Loại Câu hỏi Hiện có

Để chỉnh sửa một loại câu hỏi hiện có (ví dụ: thay đổi logic, giao diện):

1.  **Cập nhật Kiểu (Types):** Chỉnh sửa interface tương ứng trong `src/types.ts` nếu cấu trúc dữ liệu thay đổi.
2.  **Cập nhật Giao diện Người dùng (UI Component):**
    *   Tìm component UI tương ứng trong `src/components/` (ví dụ: `src/components/MultipleChoiceQuestionUI.tsx`).
    *   Chỉnh sửa logic render và xử lý tương tác.
3.  **Cập nhật Form Tạo Câu hỏi (Authoring Form):**
    *   Tìm component form tương ứng trong `src/components/authoring/` (ví dụ: `src/components/authoring/MultipleChoiceQuestionForm.tsx`).
    *   Chỉnh sửa các trường nhập liệu và logic cập nhật state.
4.  **Cập nhật Logic Chấm điểm (QuizEngine):** Nếu logic chấm điểm thay đổi, cập nhật hàm `evaluateQuestion` trong `src/services/QuizEngine.ts`.
5.  **Cập nhật Schema JSON (nếu cần):** Chỉnh sửa file schema tương ứng trong `src/schemas/`.
6.  **Cập nhật File Mẫu (nếu cần):** Chỉnh sửa file JSON mẫu trong `src/samples/`.

### Thêm Loại Câu hỏi Mới

Để thêm một loại câu hỏi hoàn toàn mới:

1.  **Định nghĩa Kiểu (Type Definition):**
    *   Trong `src/types.ts`, tạo một interface mới kế thừa từ `BaseQuestion` (ví dụ: `export interface MyNewQuestionType extends BaseQuestion { ... }`).
    *   Thêm kiểu mới này vào union type `QuizQuestion`.
    *   Thêm `questionType` string literal vào `QuestionTypeStrings`.

2.  **Tạo Component Giao diện Người dùng (UI Component):**
    *   Tạo một file component React mới trong `src/components/` (ví dụ: `MyNewQuestionUI.tsx`).
    *   Implement giao diện để hiển thị và tương tác với loại câu hỏi mới. Component này sẽ nhận props như `question` (kiểu của bạn), `onAnswerChange`, `userAnswer`, `showCorrectAnswer`.

3.  **Tạo Component Form Tạo Câu hỏi (Authoring Form):**
    *   Tạo một file component React mới trong `src/components/authoring/` (ví dụ: `MyNewQuestionForm.tsx`).
    *   Implement form để người dùng có thể nhập liệu các thuộc tính của loại câu hỏi mới. Form này sẽ nhận props như `question` và `onQuestionChange`.
    *   Sử dụng `BaseQuestionFormFields.tsx` cho các trường chung nếu phù hợp.

4.  **Cập nhật `QuestionRenderer.tsx`:**
    *   Trong `src/components/QuestionRenderer.tsx`, import component UI mới của bạn.
    *   Thêm một `case` mới vào `switch (question.questionType)` để render component UI mới.

5.  **Cập nhật `EditQuestionModal.tsx`:**
    *   Trong `src/components/authoring/EditQuestionModal.tsx`, import component form mới của bạn.
    *   Thêm một `case` mới vào `switch (currentQuestion.questionType)` trong hàm `renderQuestionForm` để render form tạo câu hỏi mới.

6.  **Cập nhật `questionTemplates.ts`:**
    *   Trong `src/components/authoring/questionTemplates.ts`, thêm một `case` mới vào hàm `getNewQuestionTemplate` để cung cấp một template mặc định khi người dùng tạo loại câu hỏi mới này.

7.  **Cập nhật `QuestionList.tsx`:**
    *   Trong `src/components/authoring/QuestionList.tsx`, thêm loại câu hỏi mới của bạn vào mảng `questionTypeOptions` để nó xuất hiện trong dropdown chọn loại câu hỏi.

8.  **Cập nhật Logic Chấm điểm (`QuizEngine.ts`):**
    *   Trong `src/services/QuizEngine.ts`, thêm một `case` mới vào `switch (question.questionType)` trong hàm `evaluateQuestion` để xử lý logic chấm điểm cho loại câu hỏi mới.

9.  **(Tùy chọn) Thêm JSON Schema:**
    *   Tạo một file schema mới trong `src/schemas/` (ví dụ: `myNewQuestionType.schema.json`).
    *   Tham khảo các schema hiện có và `baseQuestion.schema.json`.

10. **(Tùy chọn) Thêm File Mẫu JSON:**
    *   Tạo một file JSON mẫu trong `src/samples/` (ví dụ: `myNewQuestionType.sample.json`).

11. **Export (nếu cần):**
    *   Trong `src/index.ts`, export type mới, component UI, và component form nếu bạn muốn chúng có thể được import trực tiếp từ thư viện.

### Tùy chỉnh Giao diện (Styling)

*   **Tailwind CSS:** Thư viện sử dụng Tailwind CSS cho styling.
    *   Bạn có thể chỉnh sửa các class utility của Tailwind trực tiếp trong các component.
    *   File cấu hình Tailwind chính của thư viện là `tailwind.config.js` (nếu có, hoặc nó được tích hợp trong `postcss.config.js`).
    *   CSS được xử lý bởi `rollup-plugin-postcss` trong `rollup.config.js`.
*   **Blockly/Scratch Styles:**
    *   Giao diện của câu hỏi Blockly và Scratch được tùy chỉnh thêm trong `example/public/blockly-styles.css`. File này cũng được bao gồm trong gói SCORM.
    *   Nếu bạn thay đổi các theme hoặc màu sắc của Blockly/Scratch, hãy cập nhật file CSS này.

### Cấu hình SCORM

*   Cài đặt SCORM cho mỗi quiz được định nghĩa trong `quizConfig.settings.scorm` (xem `SCORMSettings` trong `src/types.ts`).
*   `SCORMService.ts` trong `src/services/` xử lý giao tiếp với SCORM API của LMS. Bạn có thể tùy chỉnh logic này nếu cần hỗ trợ các tính năng SCORM nâng cao hơn.

### Tạo Câu hỏi bằng AI (Gemini)

*   Tính năng này sử dụng Google Gemini API.
*   **API Key:** Đảm bảo biến môi trường `process.env.API_KEY` được thiết lập với API key hợp lệ của Google AI Studio (hoặc Google Cloud Vertex AI) để `AIGenerationService.ts` hoạt động. **Lưu ý:** API key này không nên được commit vào repository. Trong môi trường production hoặc khi build thư viện, key này cần được cung cấp thông qua cơ chế quản