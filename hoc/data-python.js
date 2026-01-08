const DATA_PYTHON = { 
    id: "python",
    icon: "🐍",
    name: "Lập trình Python", 
    parts: [
        { 
            name: "Chương 1: Biến & Kiểu dữ liệu", 
            questions: [ 
                { q: "Lệnh in ra màn hình trong Python?", a: ["log()", "print()", "echo", "System.out"], c: 1 },
                { q: "Cách khai báo biến đúng?", a: ["var x = 10", "int x = 10", "x = 10", "$x = 10"], c: 2 },
                { q: "Kiểu dữ liệu của 3.14 là gì?", a: ["int", "float", "str", "bool"], c: 1 },
                { q: "Kết quả của type('Hello')?", a: ["<class 'int'>", "<class 'str'>", "<class 'float'>", "String"], c: 1 }
            ]
        },
        {
            name: "Chương 2: Toán tử & Biểu thức",
            questions: [
                { q: "Kết quả của 10 // 3 là bao nhiêu?", a: ["3.33", "3", "1", "3.0"], c: 1 },
                { q: "Phép toán lũy thừa trong Python?", a: ["^", "**", "pow", "exp"], c: 1 },
                { q: "Kết quả của 10 % 3?", a: ["1", "3", "0", "10"], c: 0 },
                { q: "Thứ tự ưu tiên toán tử nào đúng?", a: ["Cộng -> Nhân -> Ngoặc", "Ngoặc -> Nhân -> Cộng", "Nhân -> Ngoặc -> Cộng", "Cộng -> Ngoặc -> Nhân"], c: 1 }
            ]
        },
        {
            name: "Chương 3: Cấu trúc rẽ nhánh (If-Else)",
            questions: [
                { q: "Từ khóa nào KHÔNG dùng trong rẽ nhánh Python?", a: ["if", "else", "elif", "switch"], c: 3 },
                { q: "Dấu hai chấm (:) dùng để làm gì?", a: ["Kết thúc lệnh", "Bắt đầu khối lệnh", "Khai báo biến", "Không có tác dụng"], c: 1 },
                { q: "Điều kiện if x == 10: trả về kiểu gì?", a: ["Integer", "String", "Boolean", "Float"], c: 2 },
                { q: "Để kiểm tra x khác y, dùng toán tử nào?", a: ["<>", "!=", "!==", "not="], c: 1 }
            ]
        },
        {
            name: "Chương 4: Vòng lặp (Loops)",
            questions: [
                { q: "Hàm range(5) tạo ra dãy số nào?", a: ["1, 2, 3, 4, 5", "0, 1, 2, 3, 4", "0, 1, 2, 3, 4, 5", "1, 2, 3, 4"], c: 1 },
                { q: "Lệnh thoát khỏi vòng lặp ngay lập tức?", a: ["stop", "exit", "break", "continue"], c: 2 },
                { q: "Lệnh bỏ qua lần lặp hiện tại để sang lần tiếp theo?", a: ["pass", "break", "continue", "skip"], c: 2 },
                { q: "Vòng lặp nào dùng khi chưa biết trước số lần lặp?", a: ["for", "while", "do-while", "foreach"], c: 1 }
            ]
        },
        {
            name: "Chương 5: Chuỗi (Strings)",
            questions: [
                { q: "Ký tự đầu tiên của chuỗi s có chỉ số là?", a: ["1", "0", "-1", "s[1]"], c: 1 },
                { q: "Làm sao để lấy độ dài chuỗi s?", a: ["s.length()", "len(s)", "s.size()", "count(s)"], c: 1 },
                { q: "Kết quả của 'Ha' * 3?", a: ["Ha3", "HaHaHa", "Lỗi", "HHHaaa"], c: 1 },
                { q: "Phương thức biến đổi chuỗi thành chữ hoa?", a: ["toUpper()", "upper()", "uppercase()", "capitalize()"], c: 1 }
            ]
        },
        {
            name: "Chương 6: Danh sách (Lists)",
            questions: [
                { q: "List được bao quanh bởi dấu gì?", a: ["()", "{}", "[]", "<>"], c: 2 },
                { q: "Thêm phần tử vào cuối List dùng lệnh gì?", a: ["add()", "insert()", "push()", "append()"], c: 3 },
                { q: "Lệnh xóa phần tử khỏi List?", a: ["delete()", "remove()", "cut()", "erase()"], c: 1 },
                { q: "Chỉ số âm -1 trong List đại diện cho?", a: ["Phần tử đầu tiên", "Phần tử cuối cùng", "Phần tử giữa", "Lỗi"], c: 1 }
            ]
        },
        {
            name: "Chương 7: Dictionary & Tuple",
            questions: [
                { q: "Tuple khác List ở điểm nào chính?", a: ["Không thể thay đổi (Immutable)", "Không chứa được số", "Chậm hơn List", "Dùng dấu []"], c: 0 },
                { q: "Dictionary lưu dữ liệu dưới dạng nào?", a: ["Chỉ số - Giá trị", "Key - Value", "Lớp - Đối tượng", "Hàng - Cột"], c: 1 },
                { q: "Để lấy giá trị của key 'name' trong dict d?", a: ["d.name", "d('name')", "d['name']", "d.get('name')"], c: 2 },
                { q: "Set (tập hợp) có đặc điểm gì?", a: ["Có thứ tự", "Cho phép trùng lặp", "Không trùng lặp", "Giống List"], c: 2 }
            ]
        },
        {
            name: "Chương 8: Hàm (Functions)",
            questions: [
                { q: "Từ khóa để định nghĩa hàm?", a: ["func", "def", "function", "define"], c: 1 },
                { q: "Hàm không trả về giá trị thì mặc định trả về gì?", a: ["0", "False", "None", "Null"], c: 2 },
                { q: "Biến khai báo trong hàm được gọi là?", a: ["Biến toàn cục", "Biến cục bộ", "Biến tĩnh", "Biến hằng"], c: 1 },
                { q: "Lệnh để trả dữ liệu về từ hàm?", a: ["send", "output", "return", "back"], c: 2 }
            ]
        }
    ] 
};