SIÊU TÀI LIỆU QUY HOẠCH TỔNG THỂ & ĐẶC TẢ
CODE CHI TIẾT: QC WORLD V2.0 (MASTER

ARCHITECTURAL BIBLE & CODE-SPEC

PROMPTS)

Dự án: Master_Open_World (QC World V2.0)​
Hệ tọa độ chuẩn: $1\text{ ô} = 1\text{ m} = 1\text{ đơn vị thế giới}$. Trục
������: Đông (+) -- Tây (−); Trục ������: Nam (+) -- Bắc (−); Trục ������: Độ cao so với mặt nước biển chuẩn
($y = 0\text{ m}$).

MỤC LỤC TỔNG QUAN

    ●​ PHẦN 0: Khắc phục triệt để 12 lỗi hiện trạng & Bản đồ phân vùng tọa độ toàn thế giới
         V2.0

    ●​ PHẦN 1: Quy hoạch QA/QC Abyssal Citadel (Thành phố dưới núi -- Biến tấu gấp đôi
         khách sạn mỏ đá Thượng Hải)

    ●​ PHẦN 2: Quy hoạch Thành Phố Trên Sông (River Tech CBD) kiểu Bắc Kinh & Sân
         Bay Quốc Tế QA/QC

    ●​ PHẦN 3: Quy hoạch Dev City -- Đại đô thị núi 8D kiểu Trùng Khánh (Tàu xuyên lầu,
         Cầu vượt 5 tầng, Raffles City, Hồng Nhai Động, Chùa Linh Sơn)

    ●​ PHẦN 4: Quy hoạch Đỉnh Núi Tối Thượng QA/QC Brain Citadel ($y = +168\text{
         m}$), Đường đèo ngắm biển & Khu vui chơi trên mây

    ●​ PHẦN 5: Quy hoạch Đảo Ngoại Ngữ Thụy Sĩ (Swiss Alpine Eden) -- 4 Ngôn ngữ
         (Anh, Trung, Nhật, Hàn)

    ●​ PHẦN 6: Quy hoạch Ốc Đảo Lấn Biển "The QC Palm Dubai" -- Phân khu bất động
         sản đồng nhất 5 cấp giá

    ●​ PHẦN 7: Đặc tả hành vi, đạo cụ và lời thoại của 55 loại Bot sống động
    ●​ PHẦN 8: BỘ 8 CODE-SPEC PROMPTS CHI TIẾT TỪNG TỌA ĐỘ (Dùng để copy dán

         thẳng cho AI Code dựng từng Module)
              ○​ Module 1: js/archKit.js -- Bộ máy kiến trúc PBR, Bo góc, Extrude &
                   Kitbashing chống thô
              ○​ Module 2: js/abyssal_island.js & js/abyssal_interior.js -- Hẻm
                   núi ngầm QA/QC & Nội thất 12 tầng học viện
              ○​ Module 3: js/brain_citadel.js -- Đường đèo biển, 12 quán săn mây &
                   Tháp Liên Hoa QA/QC Brain gấp đôi quy mô
              ○​ Module 4: js/river_cbd.js & js/bigtech_interiors.js -- Thành phố
                   trên sông & 5 Trụ sở Apple / Google / Microsoft / Nvidia / Tencent
              ○​ Module 5: js/devcity_chongqing.js -- Đô thị núi 8D Trùng Khánh, Tàu
                   Liziba, Cầu vượt Sujiaba, Raffles, Chùa

              ○​ Module 6: js/swiss_lang_island.js -- Đảo Ngoại ngữ Thụy Sĩ 4 thứ tiếng
                   & Tàu hỏa bánh răng

              ○​ Module 7: js/palm_dubai.js -- Đảo Cọ Dubai 8 nhánh lá, Vành trăng khuyết
                   & 5 hạng nhà

              ○​ Module 8: js/skyport.js & js/bots_v2.js -- Hệ thống 4 Sân bay + Đường
                   bay thật & 55 loại Bot AI

PHẦN 0: KHẮC PHỤC TRIỆT ĐỂ LỖI HIỆN TRẠNG & BẢNG PHÂN
VÙNG TỌA ĐỘ V2.0

0.1. Giải quyết 12 điểm nghẽn trong mã nguồn hiện tại
(KIEN_TRUC_HIEN_TRANG.md)

    1.​ Xóa bỏ chồng lấn tọa độ đất: Tách biệt hoàn toàn ranh giới Nam của khu đô thị (
         ������ = 460) và ranh giới Bắc của Công viên Kỳ Quan + Đảo Palm Dubai (������ = 520) bằng
         một kênh biển rộng $60\text{ m} - 180\text{ m}$.

    2.​ Xóa đường cụt & mở rộng vỉa hè biên: Khép kín mạch vòng cho mọi trục đường
         Đông -- Tây và Bắc -- Nam bằng Đại lộ Vành Đai Kè Sông rộng $24\text{ m}$; mở
         rộng mép đất thêm $12\text{ m}$ bên ngoài các trục biên để có đủ vỉa hè
         $5\text{ m}$, hàng cây và lan can đá ngắm sông.

    3.​ Mở khóa toàn bộ khối nhà đặc: Các công trình trước đây chỉ là hộp kín đứng ngoài
         bấm E (Căn hộ Sky QC tầng 2--19, English House, Hán Học Đường, Thư viện,
         Phòng thi, Bệnh viện, Trường học) được chuyển sang kiến trúc Walk-in Open
         Shell (tầng trệt đi bộ thẳng vào) kết hợp Multi-floor Portal Scene (tải tầng chi tiết khi
         dùng thang máy).

    4.​ Chuẩn hóa Luật Quy hoạch Nhà ở:
              ●​ Trong nội đô QA/QC Abyssal Island, River Tech CBD và Dev City: Người chơi
                   chỉ được phép mua/thuê Căn hộ Chung cư cao tầng (Condos / Sky Suites /
                   Underwater Suites).
              ●​ Toàn bộ Nhà mặt đất, Nhà phố giá rẻ, Biệt thự, Siêu biệt thự, Dinh thự Đế
                   vương được quy hoạch tập trung 100% tại Ốc Đảo Lấn Biển "The QC Palm
                   Dubai", chia theo từng nhánh lá đồng nhất.
                          0.2. Bảng Phân Vùng Tọa Độ Toàn Thế Giới V2.0 (Không Chồng Lấn)

Mã Khu  Tên Phân Khu Mới            Tọa độ ������ (������ → ������ )  Tọa độ ������ (������ → ������ )  Độ cao ������ (������ → ������ )                                 File Module Đảm Nhiệm
ZONE 1                              0                1    0  1                                                             min  max

ZONE 2  QA/QC Abyssal Canyon Island − 180 → + 180         − 180 → + 180         $-42\text{ m}                                        js/abyssal_island.js<br>
ZONE 3  (Đảo Hẻm Núi Ngầm)                                                      \rightarrow +28\text{                                js/abyssal_interior.js
ZONE 4                                                    − 120 → + 460         m}$
ZONE 5                                                    + 220 → + 380
ZONE 6  River Tech CBD (Thành phố   + 180 → + 580         − 950 → − 120         $0\text{ m} \rightarrow                              js/river_cbd.js<br>js/bi
ZONE 7  Trên Sông Bắc Kinh)                               − 100 → + 450         +140\text{ m}$                                       gtech_interiors.js
ZONE 8                                                    − 500 → + 250
        QA/QC International Skyport − 180 → + 240         + 520 → + 1320        $+4\text{ m} \rightarrow js/skyport.js
        (Sân bay Quốc tế)                                 + 520 → + 1350        +68\text{ m}$

        Dev City Chongqing 8D (Đô thị + 100 → + 850                             $+2\text{ m} \rightarrow js/devcity_chongqing.js
        Núi Trùng Khánh)                                                        +135\text{ m}$

        QA/QC Brain Sovereign Peak  + 620 → + 1150                              $0\text{ m} \rightarrow                              js/brain_citadel.js
        (Đỉnh Núi & Đèo Biển)                                                   +168\text{ m}$

        Swiss Language Island (Đảo  − 850 → − 250                               $0\text{ m} \rightarrow                              js/swiss_lang_island.js
        Thảo Nguyên 4 Ngôn Ngữ)                                                 +95\text{ m}$

        The QC Palm Archipelago (Ốc + 250 → + 1050                              $-8\text{ m} \rightarrow js/palm_dubai.js
        Đảo Lấn Biển Dubai)                                                     +65\text{ m}$

        Wonderland & Kỳ Quan (Khu   − 320 → + 220                               $0\text{ m} \rightarrow                              js/funisland.js<br>js/th
        Giải Trí Cảm Giác Mạnh)                                                 +98\text{ m}$                                        emepark.js

                          PHẦN 1: QUY HOẠCH "QA/QC ABYSSAL CITADEL" (THÀNH PHỐ
                          DƯỚI NÚI -- BIẾN TẤU GẤP ĐÔI CÔNG TRÌNH THƯỢNG HẢI)

                          1.1. Giải pháp Kiến trúc để Hùng Vĩ Gấp Đôi và Mang Bản Sắc Độc Bản

                              ●​ Địa hình "Hẻm Núi Song Nguyệt" (Twin-Crescent Terraced Canyon):
                                        ●​ Mở rộng miệng vực lên kích thước $360\text{ m} \times 280\text{
                                             m}$.
                                        ●​ Đỉnh vách núi ở cao độ $y = +28\text{ m}$ (trên đỉnh là Công viên Sinh
                                             thái Bậc thang, Quảng trường Đón Gió và 2 dòng thác khổng lồ đổ từ ������ =− 150
                                             và ������ =+ 150).
              ●​ Đáy hồ nước ngầm nằm ở cao độ $y = -30\text{ m}$, và lòng hồ sâu tới $y
                   = -42\text{ m}$ (chứa 2 tầng Thủy Cung Kính Chịu Lực). Tổng chiều cao
                   thông thủy từ đáy lên đỉnh vách đạt $70\text{ m}$.

    ●​ Cửa Vực Phía Nam (������: + 90 → + 180): Vách núi phía Nam tách mở tạo thành Hẻm
         Cổng Trời Thủy Đạo rộng $75\text{ m}$ nối thông mặt hồ ngầm ra Dòng Sông
         Lớn và vịnh biển.

1.2. Chi Tiết 4 Phân Khu Màu Sắc Trong Hẻm Núi

A. Ô MÀU XANH LÁ (Cánh Tây: ������: − 155 → − 18, ������: − 140 → − 40) -- 12 TẦNG HỌC
VIỆN & CÔNG TY THỰC CHIẾN QA/QC

Mỗi tầng cao $4.5\text{ m}$, uốn cong hình cánh cung bám vào vách đá Tây, ban công
trồng cây rủ xanh mướt kèm dải LED xanh lục bảo. Mỗi tầng là một Phòng Ban Thực Chiến
kiêm Trung Tâm Đào Tạo với thiết kế nội thất, bàn ghế, phòng ăn, phòng bida hoàn toàn
khác biệt:

    1.​ Tầng 12 ($y = +23.5\text{ m}$) -- AI-Driven QA & Chaos Engineering:
              ●​ Kiến trúc: Phong cách Sci-Fi Trắng -- Tím; bàn tròn Hologram 6 cạnh, màn hình
                   cong 360◦ quanh cột trụ.
              ●​ Tiện ích: Sky Billiards Lounge với 4 bàn Bida Phăng (Carom 3 băng) và 2 bàn
                   Bida Lỗ (Pool) chuẩn thi đấu đặt sát vách kính nhìn xuống thác nước; quầy Bar
                   Cold Brew.

    2.​ Tầng 11 ($y = +19.0\text{ m}$) -- Performance & Load Testing Lab (JMeter /
         k6 / Gatling):
              ●​ Kiến trúc: Trung tâm điều khiển NASA; 3 dãy bàn vòng cung giật cấp hướng vào
                   màn hình Video Wall $18\text{ m} \times 4\text{ m}$ hiển thị biểu đồ
                   TPS, Response Time, Error Rate.
              ●​ Tiện ích: Nhà Ăn Buffet Năng Lượng (quầy Teppanyaki nướng tại chỗ, máy
                   kem tươi, 8 ghế Massage tự động).

    3.​ Tầng 10 ($y = +14.5\text{ m}$) -- Playwright & Modern Web Automation:
              ●​ Kiến trúc: Silicon Valley Loft (Gỗ óc chó & Thép đen); bàn cụm chữ X 4 chỗ kèm
                   2 màn hình ngang/dọc, bảng kính trượt.
              ●​ Tiện ích: Phòng Game & Bida (2 bàn Bida Carom, 4 máy thùng Arcade, sofa da
                   xem giải E-sports).

    4.​ Tầng 9 ($y = +10.0\text{ m}$) -- API Testing & Microservices (Postman /
         Newman / GraphQL / gRPC):
              ●​ Kiến trúc: Industrial Cyberpunk với ống đồng dẫn sáng trên trần chạy xuống
                   các bàn đảo lục giác.
              ●​ Tiện ích: Specialty Coffee Roastery (máy pha Espresso Ý, bàn cờ vua/cờ
                   tướng, ban công kính bước ra sát màn thác).
5.​ Tầng 8 ($y = +5.5\text{ m}$) -- Mobile Testing & Real Device Farm (Appium /
    Scrcpy / Maestro):
         ●​ Kiến trúc: Apple Minimalist Lab; 4 bàn đá trắng nguyên khối tích hợp giá gắn
              120 thiết bị thật (Android/iOS) nối cáp quang.
         ●​ Tiện ích: Khu Pantry Nhật Bản (quầy Ramen tự động, tủ nước miễn phí, 6
              buồng ngủ trưa Capsule Nap Pods).

6.​ Tầng 7 ($y = +1.0\text{ m}$) -- Security & Pentest Vault (OWASP / Burp Suite
    / SQLi / JWT):
         ●​ Kiến trúc: Dark Ops Vault (Tường đá đen mờ, đèn neon đỏ -- lam, bàn chiến
              thuật chữ U quanh sa bàn mạng 3D).
         ●​ Tiện ích: Phòng Bida Đen & Mocktail Bar (Bàn bida nỉ đỏ rượu vang, bàn bóng
              bàn).

7.​ Tầng 6 ($y = -3.5\text{ m}$) -- CI/CD, Docker & TestOps Grid:
         ●​ Kiến trúc: Container Studio (Các phòng học làm từ thùng Container sơn màu
              Cam, Xanh dương, Vàng xếp lệch tầng).
         ●​ Tiện ích: Khu BBQ & Beer Garden Trong Nhà (Bàn gỗ dài kiểu Đức, sân khấu
              Acoustic mini).

8.​ Tầng 5 ($y = -8.0\text{ m}$) -- ERP, POS & Payment Gateway Lab:
         ●​ Kiến trúc: Retail Simulation Mall (Giả lập siêu thị mini có quầy thu ngân POS
              thật, máy quét mã vạch, máy in bill, QR MoMo/VNPay để học viên test thực
              chiến).
         ●​ Tiện ích: Nhà Hàng Á -- Âu (16 bàn đá cẩm thạch phục vụ Phở, Cơm tấm, Bò
              bít tết).

9.​ Tầng 4 ($y = -12.5\text{ m}$) -- Game QA & Frame/Hitbox Profiler Lab:
         ●​ Kiến trúc: Neo-Tokyo Game Studio (Tường vẽ Graffiti, màn hình $240\text{
              Hz}$ soi Hitbox Oval/Box và Physics).
         ●​ Tiện ích: Phòng Giải Trí Đa Năng (Bàn Bida, Bi-lắc Foosball, ghế lười
              Beanbag).

10.​Tầng 3 ($y = -17.0\text{ m}$) -- Manual Technical & ISTQB Academy:
         ●​ Kiến trúc: Giảng đường hình quạt 60 chỗ ở nửa Đông + 8 phòng thảo luận nhóm
              tường kính có bảng Kanban ở nửa Tây.
         ●​ Tiện ích: Thư Viện & Trà Đạo (Kệ sách cao sát trần $4.5\text{ m}$, bàn trà
              nhìn ra hồ ngầm).

11.​Tầng 2 ($y = -21.5\text{ m}$ -- Sát mặt hồ) -- Đại Sảnh Học Viện & Trung
    Tâm Cấp Chứng Chỉ:
         ●​ Kiến trúc: Đại sảnh đá cẩm thạch trắng, quầy lễ tân hình trăng khuyết dài
              $18\text{ m}$, Tường Vinh Danh Vàng.
         ●​ Tiện ích: Nhà Hàng Thủy Tạ có sàn gỗ bước xuống bến thuyền hồ ngầm ($y =
              -29.5\text{ m}$).

12.​Tầng 1 ($y = -36.0\text{ m}$ -- Ngầm dưới đáy hồ) -- Database & Big Data
    Underwater Vault:
              ●​ Kiến trúc: Vòm kính Acrylic chịu lực dưới đáy hồ; bên ngoài kính là đàn cá Koi
                   khổng lồ, cá tầm và thợ lặn bơi lội; bên trong là dãy Server Rack phát sáng xanh
                   băng dạy tối ưu SQL, Indexing, Partitioning.

              ●​ Tiện ích: Underwater Deep Lounge (Sofa nhung xanh biển sâu, quầy Bar dưới
                   làn nước khúc xạ).

B. Ô MÀU ĐỎ (Cánh Đông: ������: + 18 → + 155, ������: − 140 → − 40) -- 14 TẦNG CHUNG
CƯ SIÊU CẤP "ABYSSAL HORIZON RESIDENCES"

 ������ ●​ Tầng B2 & B1 ($y = -40\text{ m} \rightarrow -30\text{ m}$ --
         Underwater Sovereign Suites): Giá 45.000 /căn. Phòng khách và phòng ngủ
         Master nhìn xuyên qua vách kính cong vào lòng hồ thủy cung; giường tròn da Ý xoay
         360◦, bồn tắm cẩm thạch sát kính, đèn chùm pha lê hình sứa biển.

 ������ ●​ Tầng 1 đến Tầng 11 ($y = -28\text{ m} \rightarrow +18\text{ m}$ --
         Cliffside Panorama Sky-Condos): Giá 12.000 - 28.000 /căn. Ban công sâu
         $3.5\text{ m}$ có bể sục Jacuzzi nước nóng ngoài trời nhìn ra thác nước và ốc
         đảo; nội thất sàn gỗ xương cá, đá Marble Calacatta, bếp đảo tủ rượu vang, bàn bida
         mini trong phòng khách.

 ������ ●​ Tầng 12 & 13 ($y = +18\text{ m} \rightarrow +28\text{ m}$ -- Duplex
         Cliff Penthouse): Giá 65.000 /căn. Thông tầng có cầu thang kính xoắn, hồ bơi vô
         cực đáy kính vươn ra khỏi vách núi $4\text{ m}$ ở độ cao $60\text{ m}$ so với
         mặt hồ.

C. Ô MÀU VÀNG (Trục Giữa: ������: − 18 → + 18, ������: − 145 → − 115, $y: -42\text{ m}
\rightarrow +34\text{ m}$) -- THÁP THANG MÁY THỦY QUANG
"HYDRO-PULSE CORE"

    ●​ Cấu trúc Tháp Kính Đôi Hình Thác Pha Lê cao $76\text{ m}$, rộng $36\text{
         m}$, nhô ra khỏi vách núi $22\text{ m}$.

    ●​ Giữa 2 trục kính là dòng thác trung tâm đổ từ đỉnh núi ($y = +28\text{ m}$) xuống
         hồ ngầm ($y = -30\text{ m}$), chiếu đèn Laser Vàng Kim -- Xanh Ngọc.

    ●​ 6 Buồng Thang Máy Viên Nang Kính (Capsule Elevators) trượt dọc bên ngoài mặt
         kính + 3 Cầu Kính Ngang (Sky-Bridges) ở tầng 4, 8, 12 nối thông Cánh Xanh (Học
         viện) và Cánh Đỏ (Chung cư).
D. Ô MÀU TÍM & ĐÁY VỰC ($y = -29.5\text{ m}$) -- SHOPHOUSE NHỘN NHỊP,
ỐC ĐẢO MASTER DASHBOARD, CHÈO THUYỀN & ĐƯỜNG XE CHẠY LÊN ĐẢO

    1.​ 24 Căn Shophouse Bám Chân Vách Đá ($r = 110\text{ m} \rightarrow
         145\text{ m}$):
              ●​ Chia làm 3 dãy: Phố Thời Trang & Sneaker (8 căn: giày tăng tốc, vest, hoodie,
                   đồng hồ), Phố Ẩm Thực & Cafe (10 căn: Lẩu, Dimsum, Phở, Bánh mì, Specialty
                   Coffee có máy rang xoay, Gelato, Craft Beer), Phố Dịch Vụ (6 căn: CLB Bida,
                   Cyber Cafe, Hiệu sách, Siêu thị 24h).

    2.​ Ốc Đảo Trung Tâm "Master Dashboard Oasis" (������: − 75 → + 75, ������: − 60 → + 65, $y
         = -29.5\text{ m}$):
              ●​ Đảo Tròn Chính Giữa ($\text{Tâm } (0, 0)$, bán kính $26\text{
                   m}$): Đài phun nước tràn ngược vào tâm + Cổng Năng Lượng Master
                   Dashboard cao $12\text{ m}$ + Sa bàn Hologram 3D toàn thành phố.
              ●​ 8 Đảo Vệ Tinh Hình Cánh Sen (Bán kính $9\text{ m}$/đảo, đặt ở bán kính
                   $52\text{ m}$ quanh tâm): Đại diện cho 8 Zone Công cụ (Wiki, Plan, API,
                   Automation, Database, QC Tools, Notes, Quick Links) nối với đảo tâm
                   bằng cầu kính sát mặt nước.
              ●​ Bán Đảo Sân Khấu Nhạc Nước Bậc Thang (Khung Tím Bên Phải
                   ������: + 35 → + 85, ������: − 85 → − 45): Khán đài đá vòng cung lấn ra mặt hồ, sân
                   khấu QC Live Stage có 48 vòi nhạc nước nhảy theo nhạc YouTube và bàn DJ
                   nổi.

    3.​ Đường Đi Dạo Ngắm Sông, Chèo Thuyền & Đường Xe Chạy Lên Đảo:
              ●​ Đường Dạo Bộ Ven Hồ & Ven Sông (Promenade): Rộng $6\text{ m}$, lát
                   đá granite xen gỗ Teak, chạy vòng quanh hồ ngầm rồi men theo hai bờ kênh ra
                   tận Thành phố Trên Sông.
              ●​ Bến Thuyền Kayak & Gondola: Đặt tại $(-35, +45, y = -29.5\text{
                   m})$, cho phép người chơi tự chèo thuyền ngắm thác hoặc đi dọc sông.
              ●​ 2 Tuyến Đường Hầm Bán Lộ Thiên Xoắn Ốc Cho Xe Chạy ("Twin Helix
                   Gallery Roads"): Khoét vào lòng vách đá Đông và Tây (rộng $12\text{ m}$,
                   độ dốc êm $8\%$, có hàng cột vòm đá mở ra lòng hồ) dẫn xe ô tô và xe máy
                   chạy mượt từ đáy vực ($y = -29.5\text{ m}$) lên mặt đất ($y =
                   +2\text{ m}$) và lên đỉnh núi ($y = +28\text{ m}$).
PHẦN 2: THÀNH PHỐ TRÊN SÔNG (RIVER TECH CBD) & SÂN BAY
QUỐC TẾ QA/QC

2.1. Đô Thị Lấn Sông Kiểu Bắc Kinh CBD (������: + 180 → + 580,
������: − 120 → + 460)

    ●​ Quy hoạch thành 4 Hòn Đảo Bồi Đắp Nhân Tạo ngăn cách bởi 3 nhánh sông xanh
         biếc, nối bằng 12 cây cầu kiến trúc độc bản.

    ●​ Ban đêm rực sáng như Bắc Kinh CBD (Khu Quốc Mậu) với hệ thống đèn LED chạy
         dọc các gờ tháp, đèn lồng đỏ dọc kè đá và nhạc nước trên sông.

    ●​ Trong khu đô thị này, nhà ở bán cho người chơi 100% là Căn hộ Chung cư Cao tầng
         (High-rise Luxury Condos).

2.2. Năm Tòa Nhà Biểu Tượng QA/QC Trên Sông (Ngoại Thất Lạ & Nội Thất
Khác Nhau 100%)

    1.​ THE INFINITE LOOP QA RING ($\text{Tâm } (280, -30)$, Đường kính ngoài
         $110\text{ m}$, Đường kính sân trong $60\text{ m}$, cao $24\text{ m}$ --
         Cảm hứng từ Apple Park):
              ●​ Ngoại thất: Vòng nhẫn kính cong khổng lồ nổi trên bán đảo sông, mái pin mặt
                   trời bạc, bao quanh khu rừng cây ăn quả và hồ cá Koi ở tâm.
              ●​ Nội thất: Hành lang cong vô tận; bàn gỗ Sồi trắng dài $8\text{ m}$ xếp theo
                   tia hướng tâm; phòng họp dạng buồng kính tròn ("Glass Pods") treo lơ lửng;
                   Phòng Giám đốc ở cung Bắc tầng 5 nhìn toàn cảnh 180◦ với bàn nhôm nguyên
                   khối CNC.

    2.​ DRAGONSCALE AUTO-LABS ($\text{Tâm } (440, -20)$, $90\text{ m}
         \times 70\text{ m}$, cao $28\text{ m}$ -- Cảm hứng từ Google Bay View):
              ●​ Ngoại thất: Mái lượn sóng hình Vảy Rồng Bạc nâng đỡ bởi các cột nghiêng đón
                   gió sông.
              ●​ Nội thất: Tầng 1 như một khu phố sáng tạo có xe Cafe cổ, sân bóng rổ mini, cầu
                   trượt ống xoắn cho nhân viên trượt từ tầng 2 xuống tầng 1; bàn làm việc lục
                   giác tổ ong; phòng họp dạng lều Glamping; Phòng Giám đốc trên gác lửng mở
                   có bàn Bida riêng.

    3.​ SILICON FOREST & TREEHOUSE HUB ($\text{Tâm } (290, 160)$, $85\text{
         m} \times 75\text{ m}$ -- Cảm hứng từ Microsoft Campus):
              ●​ Ngoại thất: 4 khối nhà gỗ Tuyết tùng và kính lệch tầng, có 6 cây cổ thụ cao
                   $32\text{ m}$ mọc xuyên từ mặt nước qua sàn nhà lên mái.
              ●​ Nội thất: Suối nhân tạo chảy dưới sàn kính giữa các dãy bàn; Phòng họp là 3
                   Ngôi Nhà Trên Cây (Treehouses) nối bằng cầu treo gỗ; Phòng Giám đốc là
                   biệt thự kính trên mái vườn (Sky Garden).
    4.​ THE TRI-MATRIX PERF CENTER ($\text{Tâm } (450, 170)$, Kim tự tháp tam
         giác cạnh $85\text{ m}$, cao $38\text{ m}$ -- Cảm hứng từ NVIDIA
         Voyager):
              ●​ Ngoại thất: Khối đa diện cắt vát gồm hàng trăm ô giếng trời hình tam giác phát
                   sáng xanh lá mạ.
              ●​ Nội thất: Trung tâm là Đại Cầu Thang Tam Giác rộng $20\text{ m}$ làm
                   khán đài Tech Talk; bàn làm việc xếp theo tam giác đồng tâm với 3 màn hình
                   cong; Phòng Giám đốc đặt ngay đỉnh chóp kính nhìn xuống toàn bộ đại sảnh.

    5.​ CANTILEVER CYBER TWIN-TOWER ($\text{Tâm } (370, 340)$, $90\text{
         m} \times 60\text{ m}$, cao $120\text{ m}$ / 32 tầng -- Cảm hứng từ
         CCTV Bắc Kinh & Tencent):
              ●​ Ngoại thất: 2 tòa tháp nghiêng mọc từ hai bờ kênh đào rồi vắt ngang nối liền
                   nhau ở tầng 25--30 tạo thành Cổng Trời trên mặt sông.
              ●​ Nội thất: Tầng 25--30 là Khối Cầu Kính Đáy Trong Suốt ở độ cao $95\text{
                   m}$ chứa Đại Phòng Họp Hội Đồng Quản Trị, CLB Bida & Cigar Thượng Lưu, và
                   Phòng Chủ Tịch Tập Đoàn.

2.3. Cảng Hàng Không Quốc Tế QA/QC (������: − 180 → + 240,
������: + 220 → + 380)

    ●​ Nhà ga "The Manta Ray" ($160\text{ m} \times 75\text{ m}$, cao
         $28\text{ m}$): Có thác nước nhân tạo đổ từ mái vòm kính xuống giữa nhà ga (kiểu
         Jewel Changi), quầy Check-in, soi chiếu an ninh, phòng chờ VIP (có bàn Bida và
         Buffet), 6 ống lồng.

    ●​ 2 Đường băng nổi trên biển ($420\text{ m} \times 50\text{ m}$) + Đài
         Không Lưu ATC cao $68\text{ m}$.

    ●​ Cho phép người chơi mua vé bay thật (máy bay cất cánh, bay qua mây và hạ cánh) tới
         Dev City, Đỉnh QA/QC Brain, Đảo Ngoại Ngữ và Đảo Palm Dubai.

PHẦN 3: DEV CITY -- ĐẠI ĐÔ THỊ NÚI 8D KIỂU TRÙNG KHÁNH (
������: + 100 → + 850, ������: − 950 → − 120)

    1.​ Địa hình 4 Thềm Độ Cao Chồng Lên Nhau:
              ●​ Thềm 1 ($y = +2\text{ m}$ -- Bờ sông), Thềm 2 ($y = +24\text{ m}$ --
                   Lưng núi), Thềm 3 ($y = +52\text{ m}$ -- Đô thị cao nguyên & Hồ giữa
                   núi), Thềm 4 ($y = +85\text{ m}$ -- Đỉnh mây, Sân bay & Chùa).

    2.​ Giao Thông Đa Tầng Kỳ Vĩ:
              ●​ Tàu Điện Xuyên Chung Cư (Liziba Station tại $(380, -420, y =
                   +38\text{ m})$): Tuyến tàu điện nối từ QA/QC Island chạy trên cầu cạn ven
                   sườn núi rồi đâm xuyên thẳng qua tầng 6--8 của tòa chung cư 18 tầng (có sân
                   ga đón khách ngay trong bụng tòa nhà).
              ●​ Nút Giao Thông Xoắn Ốc 5 Tầng Sujiaba ((280, − 310), cao $72\text{
                   m}$): Đường cao tốc xoay vòng 360◦ trên trụ cao vút kết hợp cầu dây văng 2
                   tầng vượt sông.

              ●​ Hệ thống Hầm Đường Bộ Xuyên Núi Đá: 3 đường hầm khoét qua lòng núi dẫn
                   lên khu trung tâm.

    3.​ Các Công Trình Biểu Tượng Trong Dev City:
              ●​ Tổ Hợp Tháp Ngang "DEV RAFFLES SKY-CRYSTAL" (
                   ������: 420 → 560, ������: − 280 → − 190): 4 tòa tháp cánh buồm cao $115\text{ m}$
                   nâng đỡ Ống Kính Nằm Ngang "The Crystal" dài $140\text{ m}$ ở độ cao
                   $y = +95\text{ m}$ (bên trong dạy kiến trúc phần mềm, Backend,
                   Frontend, AI, kèm hồ bơi vô cực và vườn nhiệt đới trên không).
              ●​ Phố Cổ Treo Vách Đá 11 Tầng "HỒNG NHAI ĐỘNG" ($x: 160
                   \rightarrow 260, z: -260 \rightarrow -190, y: +2\text{ m}
                   \rightarrow +46\text{ m}$): Nhà sàn gỗ mái cong xếp chồng 11 tầng rực
                   sáng đèn lồng vàng cam bên bờ sông.
              ●​ Quần Thể Tâm Linh "LINH SƠN VÂN TỰ" ($x: 680 \rightarrow 820,
                   z: -780 \rightarrow -620, y: +65\text{ m} \rightarrow
                   +125\text{ m}$): Bảo tháp bát giác 9 tầng cao $54\text{ m}$, Chánh
                   điện treo vách đá kiểu Huyền Không Tự, Cầu treo xích sắt vượt vực và Tượng
                   Phật cao $32\text{ m}$ trong mây.
              ●​ Công Viên Giữa Hồ Trên Núi ($y = +52\text{ m}$), Sân Bay Đỉnh Núi
                   Dev City ($y = +82\text{ m}$), Khách sạn 5 sao, Bệnh viện, Trạm cứu
                   hỏa, Trường học.

PHẦN 4: ĐỈNH NÚI TỐI THƯỢNG "QA/QC BRAIN CITADEL" &
CUNG ĐƯỜNG ĐÈO BIỂN (������: + 620 → + 1150, ������: − 100 → + 450
)

    1.​ Cung Đường Đèo Vòng Núi Ngắm Biển Dạt Dào ("The Oceanfront Corniche" --
         $y: +4\text{ m} \rightarrow +110\text{ m}$):
              ●​ Đường đèo uốn lượn quanh sườn núi đá dựng đứng sát đại dương; có đoạn
                   vươn hẳn ra biển trên cầu cạn trụ tròn, đoạn chui qua vòm đá khắc tự nhiên, và
                   đoạn đi qua Cầu Kính Cổng Trời dài $95\text{ m}$.
              ●​ Dọc đường đèo là 12 Hàng Quán Săn Mây Kiến Trúc Độc Bản (Lầu trà đạo
                   vươn ra biển, Quán Bistro trong hang đá đèn lồng, Quán Cafe 3 quả cầu kính
                   Geodesic, Quán Hải sản hình con thuyền gỗ trên ghềnh đá, CLB Bida & Bia thủ
                   công ngắm hoàng hôn).

    2.​ Kiến Trúc "QA/QC BRAIN CITADEL" -- Bự Gấp Đôi, Cao Hơn, Lạ Hơn ($y =
         +110\text{ m} \rightarrow +168\text{ m}$):
              ●​ Quảng trường đỉnh núi: Đường kính $120\text{ m}$ ($r = 60\text{
                   m}$) ở cao độ $y = +110\text{ m}$.

              ●​ Tháp Liên Hoa Thần Kinh (Levitating Neural Lotus): Đường kính $56\text{
                   m}$ ($r = 28\text{ m}$, gấp đôi tháp cũ), cao $58\text{ m}$ (đỉnh đạt
                   $y = +168\text{ m}$ -- cao nhất game), gồm 8 Cánh Hoa Sen Kính
                   Titanium mở bung ra bốn phía, cầu thang xoắn đôi hình Chuỗi ADN phát sáng,
                   và trên đỉnh là 3 Vòng Gyroscope Vàng đường kính $34\text{ m}$ quay
                   quanh Khối Não Bộ Pha Lê Đa Diện ($18\text{ m} \times 15\text{ m}
                   \times 22\text{ m}$).

              ●​ 6 Tầng Nội Dung: Bảo tàng Lịch sử & Thảm họa Phần mềm, Đấu trường VR
                   Test Design, Trung tâm Chỉ huy Hiệu năng & Bảo mật, Đại sảnh Danh vọng &
                   Cổng Không gian Bí ẩn, Nhà hàng Xoay 360◦ & Phòng Bida Hoàng gia, Đài Thiên
                   văn & Trung tâm AI QA Brain.

              ●​ Sân Bay Đỉnh Mây (Brain Skyport) ở cánh Đông + Khu Vui Chơi Cảm Giác
                   Mạnh Trên Đỉnh Vực ở cánh Nam (Xích đu tử thần vượt vực biển, Xe trượt kính
                   xoắn ốc quanh núi, Khinh khí cầu).

PHẦN 5: HÒN ĐẢO LANGUAGE LEARNING -- THẢO NGUYÊN
THỤY SĨ 4 NGÔN NGỮ (������: − 850 → − 250, ������: − 500 → + 250)

    1.​ Cảnh Quan Thảo Nguyên Thụy Sĩ (Lauterbrunnen Valley):
              ●​ Dãy núi tuyết Alps cao $95\text{ m}$ ở phía Bắc, thác nước bạc chảy thành
                   suối băng uốn lượn qua đồng cỏ hoa vàng nhấp nhô nhẹ ($y = +2\text{ m}
                   \rightarrow +18\text{ m}$), cối xay gió, đàn bò sữa đeo chuông.
              ●​ Tàu Hỏa Bánh Răng Đỏ (Swiss Cogwheel Train) chạy qua cầu cạn đá vòm nối
                   toàn đảo + Sân bay Thủy phi cơ + Làng Du lịch Chalet Gỗ (Nhà hàng Lẩu
                   Phô mai Fondue, Tiệm Sô-cô-la & Đồng hồ, Khu trượt tuyết).

    2.​ Bốn Quần Thể Học Viện Ngôn Ngữ (Mở Thông Nội Thất 100%):
              ●​ Khu Tiếng Anh (-420, -80): Lâu đài Đá Oxford + Nhà kính Hoàng gia Kew
                   Gardens + Tháp Big Ben ($0 \rightarrow \text{IELTS } 8.0+$).
              ●​ Khu Tiếng Trung (-680, -80): Cung điện & Lâm viên Tô Châu nổi trên hồ
                   sen + Cầu Cửu Khúc ($0 \rightarrow \text{HSK } 7-9$).
              ●​ Khu Tiếng Nhật Mới (-420, -280): Lâu đài gỗ Kyoto + Cổng Torii đỏ dưới hồ
                   + Vườn đá Zen & 40 cây Hoa Anh Đào rụng cánh
                   ($\text{Hiragana/Katakana} \rightarrow \text{JLPT
                   N5}-\text{N1}$ + Tiếng Nhật IT).
              ●​ Khu Tiếng Hàn Mới (-680, -280): Cung điện cổ Hanok Khánh Hội Lâu kết
                   hợp Tòa nhà kính K-Cube Gangnam & Rừng cây Ngân hạnh vàng
                   ($\text{Hangul} \rightarrow \text{TOPIK I & II}$).
     PHẦN 6: ỐC ĐẢO LẤN BIỂN "THE QC PALM DUBAI" & PHÂN KHU

     BẤT ĐỘNG SẢN ĐỒNG NHẤT (������: + 250 → + 1050,

     ������: + 520 → + 1320)

         ●​ Thân Cọ Trung Tâm (The Trunk -- Rộng $110\text{ m}$, dài $420\text{ m}$):

        ������ Chỉ dành cho Chuỗi Nhà hàng, Quán ăn, Beach Club, Bến tàu Monorail và 4 Tòa Chung

              cư Biển Cao tầng (8.000 - 18.000 ).
         ●​ 8 Nhánh Lá Cọ Đối Xứng (Mỗi cặp nhánh chỉ xây duy nhất 1 kiểu nhà đồng bộ

        ������ 100%):
                   ●​ Nhánh 1 & 2 (Hạng 1 -- Nhà Giá Rẻ Khởi Nghiệp 2.500 ): 24 căn
                        Townhouse Địa Trung Hải trắng -- xanh coban ($8\text{ m} \times
            ������ 10\text{ m}$, 2 tầng, có vườn rau).
                   ●​ Nhánh 3 & 4 (Hạng 2 -- Nhà Phố Thượng Lưu 12.000 ): 18 căn Modern
                        Glass Duplex ($12\text{ m} \times 14\text{ m}$, gara ô tô, hồ bơi
            ������ Plunge Pool bên hông).
                   ●​ Nhánh 5 & 6 (Hạng 3 -- Biệt Thự Đơn Lập Hồ Bơi 35.000 ): 12 căn
                        Tropical Luxury Villa ($18\text{ m} \times 20\text{ m}$, hồ bơi tràn bờ
            ������ $10\text{ m}$ sát biển, phòng Bida riêng, 1 Quản gia).
                   ●​ Nhánh 7 & 8 (Hạng 4 -- Siêu Biệt Thự Bến Du Thuyền 85.000 ): 8 căn
                        Avant-Garde Mansion ($26\text{ m} \times 28\text{ m}$, 3 tầng kính,
                        hồ bơi vô cực chữ L có quầy Bar chìm, bến đậu Du thuyền riêng, Gara kính 2
                        siêu xe, rạp phim gia đình, 2 Quản gia & Đầu bếp).

      ������ ●​ Vành Trăng Khuyết Bao Quanh (Hạng 5 -- Siêu Siêu Cấp Biệt Thự Đế Vương
              250.000 ):
                   ●​ 5 Dinh thự Hoàng gia ($50\text{ m} \times 45\text{ m}$, 3 tầng nổi + 1
                        tầng ngầm thủy cung dưới biển), có Bãi đáp Trực thăng trên mái, Bến Siêu Du
                        Thuyền $24\text{ m}$, Hồ bơi vô cực kép, Gara xoay 4 siêu xe, và 5 NPC
                        phục vụ riêng.

     PHẦN 7: BẢNG TỔNG HỢP 55 LOẠI BOT SỐNG ĐỘNG (AI
     BEHAVIORS & PROPS)

Mã   Tên Vai Trò Bot              Số Lượng  Khu Vực Hoạt Động                                        Hành Vi & Đạo Cụ Đặc Trưng

B01  Công nhân Lau Kính Trên Cao  4         Tháp Thang máy Vàng & Raffles Đứng trên sàn cáp treo Gondola
                                                                                            di chuyển dọc mặt kính, tay gạt
Mã   Tên Vai Trò Bot              Số Lượng  Khu Vực Hoạt Động               Hành Vi & Đạo Cụ Đặc Trưng

                                                                            cần lau kính, vẫy chào người đi
                                                                            thang máy.

B02  Kỹ sư Bảo trì Thang Máy      2         Đỉnh Tháp Vàng ($y =            Cầm tablet kiểm tra áp suất thác
                                            +30\text{ m}$)                  nước và cáp.

B03  Cơ thủ Bida Carom 3 Băng     6         Tầng 12 Học viện & Tầng 28 CBD  Cúi người nhắm cơ bida, đẩy cơ
                                                                            đánh bi lăn thật trên bàn nỉ xanh,
                                                                            thoa lơ.

B04  Học viên Chạy Tải JMeter     8         Tầng 11 Học viện QA/QC          Gõ máy trước 3 màn hình, chỉ tay
                                                                            lên Video Wall khi TPS đạt đỉnh.

B05  Chuyên gia Device Farm       3         Tầng 8 Học viện QA/QC           Đi dọc dãy 120 điện thoại thật
                                                                            kiểm tra log Automation.

B06  Người Chèo Thuyền Kayak      5         Hồ ngầm $y = -30\text{          Chèo thuyền Kayak đôi khuấy
                                            m}$ & Kênh CBD                  nước tung bọt trắng dưới chân
                                                                            thác.

B07  Stylist Shophouse Giày & Áo  4         Dãy Shophouse đáy vực           Đứng cửa tiệm cầm hộp Sneaker
                                                                            phát sáng mời khách thử đồ.

B08  Thợ Rang & Pha Cafe Thủ Công 4         Quán Cafe Đáy vực & Tầng 9      Rót bình Pour-over theo vòng
                                                                            tròn, vận hành máy rang cà phê
                                                                            xoay.

B09  Thợ Lặn Thủy Cung            2         Ngoài vách kính tầng ngầm $y = Đeo bình lặn bơi giữa đàn cá

                                            -36\text{ m}$                   Koi/cá tầm, vẫy tay qua kính với

                                                                            người trong phòng DB.

B10  Nghệ sĩ Violin / DJ Nhạc Nước 3        Bán đảo Sân khấu Khung Tím      Chơi nhạc đồng bộ với 48 vòi
                                                                            phun nước và ánh sáng Laser.

B11  Quản Gia Trưởng Tư Dinh      12        Biệt thự Đảo Palm Dubai         Mặc Tuxedo đen + găng trắng,
                                                                            cúi chào 30◦ khi chủ nhà về, bật
                                                                            đèn & nhạc.

B12  Đầu Bếp Michelin Tư Gia      5         Siêu Biệt thự Nhánh 7--8 & Vành Đội mũ bếp trắng, áp chảo bò

                                            Trăng                           Wagyu bốc lửa tại đảo bếp.

B13  Nhân viên Chăm sóc Hồ Bơi    6         Hồ bơi vô cực Đảo Palm          Cầm vợt cán dài vớt lá mặt nước,
                                                                            trải khăn tắm nắng.
Mã        Tên Vai Trò Bot            Số Lượng  Khu Vực Hoạt Động             Hành Vi & Đạo Cụ Đặc Trưng
B14       Vệ sĩ Dinh thự Đế Vương    8
B15                                            Cổng Vành Trăng Khuyết        Mặc vest đen, kính râm, tai nghe
B16                                                                          xoắn, đi tuần quanh dinh thự.
B17
B18       Thuyền trưởng Du thuyền Riêng 6      Bến sau Siêu Biệt thự         Đứng trên mũi du thuyền riêng
B19                                                                          chờ lệnh chở chủ nhà ra khơi.
B20
B21--B30  Tài xế Limousine Riêng     4         Trước sảnh Dinh thự Đảo Palm  Đứng cạnh cửa xe Limousine,
                                                                             mở cửa chở chủ nhà đi làm/ra
B31--B40                                                                     sân bay.

B41--B55  DJ & Vũ công Beach Club    6         Thân Cọ (The Trunk)           Khuấy động bữa tiệc bên hồ bơi
                                                                             tràn bờ.

          Chuyên viên Môi giới BĐS   3         Sảnh đón Đảo Palm Dubai       Đứng cạnh sa bàn 3D tư vấn 5
                                                                             phân khu nhà ở.

          Thợ Chăm sóc Siêu Xe       4         Gara kính xoay Dinh thự       Đánh bóng dàn siêu xe Roadster
                                                                             & Limo.

          Vận động viên Flyboard     3         Vịnh giữa các nhánh lá cọ     Bay vọt lên cao $12\text{ m}$
                                                                             bằng ván phản lực nước.

          Đội Bot Hàng Không & Giao  37        4 Sân bay & Tuyến Monorail    Cơ trưởng, Tiếp viên, Nhân viên
                                                                             vẫy gậy sáng Marshaller, Lái xe
          Thông                                                              hành lý, Lái tàu xuyên nhà Liziba,
                                                                             Khách săn ảnh tàu xuyên lầu, Phi
                                                                             công trực thăng, Điều khiển
                                                                             Drone giao hàng, CSGT cầu vượt
                                                                             5 tầng, Nhân viên cáp treo.

          Đội Bot Trùng Khánh & CBD  36        Dev City & River Tech CBD     Sư thầy gõ chuông chùa Linh
                                                                             Sơn, Khách thả hoa đăng, Nghệ
                                                                             nhân múa mì Hồng Nhai Động,
                                                                             Nghệ nhân Biến diện Tứ Xuyên,
                                                                             Principal Architect trên cầu kính
                                                                             Raffles, Lính cứu hỏa, Bác sĩ trực
                                                                             thăng, Nghệ sĩ đàn Cổ tranh,
                                                                             Người bán kẹo hồ lô, Bảo vệ đi
                                                                             Segway ở Apple Ring.

          Đội Bot Đỉnh Brain & Ngoại Ngữ 44    Đỉnh QA/QC Brain & Đảo Thụy Sĩ Viện trưởng QA Brain, Khách
                                                                                               chơi xích đu vực thẳm, Trà sư
Mã  Tên Vai Trò Bot  Số Lượng  Khu Vực Hoạt Động                                            Hành Vi & Đạo Cụ Đặc Trưng

                                                                                            đèo biển, Giáo sư IELTS Oxford,
                                                                                            Lão sư HSK Tô Châu, Sensei
                                                                                            Tiếng Nhật Kyoto, Giảng viên
                                                                                            Tiếng Hàn Seoul, Nghệ nhân thổi
                                                                                            kèn Alphorn Thụy Sĩ, Người chăn
                                                                                            bò sữa, Lái tàu bánh răng đỏ,
                                                                                            VĐV trượt tuyết, Thợ Sô-cô-la,
                                                                                            Phi công thủy phi cơ, Nhóm sinh
                                                                                            viên quốc tế, Drone Flycam.

    PHẦN 8: BỘ 8 CODE-SPEC PROMPTS CHI TIẾT TỪNG TỌA ĐỘ
    (DÙNG ĐỂ COPY DÁN THẲNG CHO AI CODE DỰNG TỪNG
    MODULE)

            Hướng dẫn sử dụng: Khi bạn muốn AI code xây dựng phân khu nào, bạn chỉ cần
            Copy nguyên khối Prompt của Module đó bên dưới và dán vào khung chat của
            AI code. Mọi hàm tích hợp với world.html và life.js (W.scene, W.addPlat,
            W.addBox, W.addSeg, W.circles, W.INTER, W.addSeat, W.PLACES, W.EXTL,
            HOOK.camBox) đều đã được khớp đúng chuẩn kiến trúc repo
            Master_Open_World của bạn!

    MODULE 1 PROMPT: BỘ MÁY KIẾN TRÚC CHỐNG THÔ (js/archKit.js)

       None‎
       Hãy tạo file mới `js/archKit.js` trong dự án Master_Open_World để nâng cấp toàn bộ
       chất lượng đồ họa kiến trúc Three.js từ khối hộp thô sang kiến trúc PBR sắc nét,
       bo góc mềm mại và có chiều sâu 3D thật.

       Yêu cầu kỹ thuật bắt buộc trong `js/archKit.js`:
       1. Import `* as THREE from 'three'` và `{ RoundedBoxGeometry } from
       'three/addons/geometries/RoundedBoxGeometry.js'`.
       2. Xuất hàm `makePBRFacade(opts)`:

            - Nhận `{ cols, rows, frameCol, glassCol, litCol, litProb, balcony, mullionW,
       seed }`.

            - Sinh đồng thời 3 Canvas 512x512:
                + `diffuseMap`: Vẽ khung tường/đá/nhôm và các ô cửa sổ kính (có rèm mờ bên

       trong và ánh đèn vàng ấm ban đêm).
            + `roughnessMap`: Khung tường có độ nhám cao (`#d8d8d8`), mặt kính bóng phản
   chiếu bầu trời (`#121212`).

            + `bumpMap`: Khung cửa và gờ tường nổi cao (`#ffffff`), mặt kính lõm sâu vào
   trong (`#1a1a1a`), `bumpScale = 0.22`.

        - Trả về `THREE.MeshStandardMaterial` có `metalness: 0.35`, `envMapIntensity:
   1.5`, hỗ trợ đổi độ sáng ban đêm qua `W.night`.
   3. Xuất hàm `buildCurvedTerraceWing(W, cfg)`:

        - Dùng `THREE.Shape()` + `THREE.ExtrudeGeometry` (với `bevelEnabled: true,
   bevelThickness: 0.18, bevelSize: 0.15, curveSegments: 40`) để dựng các tòa nhà
   hình cánh cung giật cấp bậc thang bám vào vách núi (dùng cho Cánh Xanh 12 tầng và
   Cánh Đỏ 14 tầng của QA/QC Abyssal Island).

        - Mỗi tầng tự động sinh:
            + Mặt sàn bê tông viền đá trắng bo tròn.
            + Dải lan can kính cong (`CylinderGeometry` rỗng hai đầu cắt theo góc cung

   `thetaStart`, `thetaLength`).
            + Dải cây xanh rủ xuống từ ban công (dùng `InstancedMesh` các cụm lá xanh rủ

   dọc mép ban công giống khách sạn mỏ đá Thượng Hải).
            + Dải đèn LED viền sàn phát sáng theo màu phân khu (`0x10b981` cho Cánh Xanh,

   `0xf43f5e` cho Cánh Đỏ).
   4. Xuất hàm `buildAsianCurvedRoof(w, d, h, eavesOverhang, color, tiers)`:

        - Tạo mái đao cong vút 4 góc kiểu Chùa Trùng Khánh / Tô Châu / Kyoto bằng cách
   biến đổi tọa độ đỉnh $y$ của lưới mái theo hàm parabol bậc hai tại 4 góc:

            $$\Delta y(x, z) = k \cdot \left(\frac{|x|}{w/2}\right)^2 \cdot
   \left(\frac{|z|}{d/2}\right)^2$$

        - Có sống mái, đầu đao cong và đèn lồng đỏ treo ở 4 góc mái.
   5. Xuất hàm `buildBilliardTable(W, x, y, z, rotY, feltColor = 0x0d7a4f, scope =
   'interior')`:

        - Dựng bàn Bida chi tiết cao bằng `RoundedBoxGeometry`: Khung gỗ óc chó bo góc
   ($2.84\text{ m} \times 1.42\text{ m}$, cao $0.78\text{ m}$), mặt đá bọc nỉ
   xanh/đỏ, 6 chân tiện tròn mạ đồng, 3 viên bi (Trắng, Vàng, Đỏ) cho bàn Carom hoặc
   15 bi màu cho bàn Pool, 2 cây cơ đặt trên bàn và đèn chụp 3 chao treo phía trên ở

 ������ $y + 1.85\text{ m}$.
        - Đăng ký hộp va chạm và điểm tương tác `W.INTER` (" Đánh một cơ Bida 3 băng
   (E)") có hoạt cảnh bi chạy va băng thật trên mặt bàn!

MODULE 2 PROMPT: HẺM NÚI NGẦM QA/QC & NỘI THẤT 12 TẦNG HỌC
VIỆN (js/abyssal_island.js & js/abyssal_interior.js)

   None‎
   Hãy nâng cấp và thay thế không gian Đảo chính hiện tại bằng tổ hợp "QA/QC ABYSSAL
   CITADEL" (Thành phố Dưới Núi lấy cảm hứng từ Khách sạn Hẻm núi Thượng Hải nhưng
   quy mô gấp đôi và biến tấu thành Song Nguyệt Địa Cung) thông qua 2 file
   `js/abyssal_island.js` và `js/abyssal_interior.js`.
### 1. ĐỊA HÌNH HẺM NÚI & HỒ NGẦM (`js/abyssal_island.js`)
- Phạm vi tọa độ: $x \in [-180, +180]$, $z \in [-180, +180]$.
- Công thức độ cao địa hình $h(x, z)$:

   + Khoảng cách chuẩn hóa theo elip miệng vực:
       $$r_e(x, z) = \sqrt{\left(\frac{x}{155}\right)^2 + \left(\frac{z +

15}{130}\right)^2}$$
   + Trừ khe cửa vực phía Nam ($z > 70$, $|x| < 38$) mở thông ra sông lớn ở độ cao

đáy hồ.
   + Khi $r_e \ge 1.08$: Mặt đỉnh núi vành đai ở cao độ $y = +28.0\text{ m} +

\text{fbm}(x, z) \cdot 2.5\text{ m}$ (trồng thông, thảm cỏ, đường dạo đỉnh vách và
2 thượng nguồn thác nước tại $(-148, -30, +28)$ và $(+148, -30, +28)$).

   + Khi $0.82 < r_e < 1.08$: Vách đá bazan dựng đứng giật cấp từ $y = +28\text{
m}$ xuống $y = -30\text{ m}$, cộng nhiễu đá phân lớp `ridgedNoise`.

   + Khi $r_e \le 0.82$: Lòng hồ ngầm ở $y = -42\text{ m}$ (đáy thủy cung), mặt
nước hồ ngầm trong vắt phản chiếu đặt ở $y_{\text{water}} = -29.5\text{ m}$.

### 2. BỐN KHỐI KIẾN TRÚC CHÍNH TRONG HẺM NÚI
1. **KHỐI XANH LÁ (Cánh Tây - Học Viện & Phòng Ban QA/QC - 12 Tầng):**

     - Bám vào vách đá Tây Bắc: Tâm cung tại $(-15, -35)$, bán kính ngoài
$R_{\text{out}} = 128\text{ m}$, bán kính trong $R_{\text{in}} = 96\text{ m}$, góc
quét từ $\theta_1 = 3.35\text{ rad}$ đến $\theta_2 = 4.55\text{ rad}$.

     - Gồm 12 tầng từ $y = -36.0\text{ m}$ (Tầng 1 Thủy cung Database ngầm dưới mặt
nước hồ) lên tới $y = +23.5\text{ m}$ (Tầng 12 AI QA & Sky Billiards), mỗi tầng
cao $4.5\text{ m}$.

  ������ - Dùng `buildCurvedTerraceWing` từ `archKit.js` với vườn cây rủ dọc từng tầng

và bảng chữ phát sáng trên đỉnh: `" QA · QC · QE ACADEMY & TECH HUB"`.

2. **KHỐI ĐỎ (Cánh Đông - Chung Cư Siêu Cấp Luxury - 14 Tầng):**
     - Đối xứng qua trục giữa, bám vách đá Đông Bắc: Tâm cung $(+15, -35)$,

$R_{\text{out}} = 128\text{ m}$, $R_{\text{in}} = 96\text{ m}$, góc quét từ
$\theta_1 = 4.87\text{ rad}$ đến $\theta_2 = 6.07\text{ rad}$.

     - Gồm 2 tầng ngầm dưới mặt hồ ($y = -40\text{ m} \rightarrow -30\text{ m}$:
Underwater Suites nhìn ra đàn cá bơi) + 12 tầng nổi ($y = -28\text{ m} \rightarrow
+26\text{ m}$), có bể sục Jacuzzi ngoài ban công và hồ bơi vô cực đáy kính ở tầng
Penthouse trên cùng.

3. **KHỐI VÀNG (Trục Giữa - Tháp Thang Máy Thủy Quang Đôi):**
     - Tọa độ: $x \in [-18, +18]$, $z \in [-148, -112]$, kéo dài từ đáy hồ $y =

-42\text{ m}$ lên đỉnh $y = +34\text{ m}$ (cao $76\text{ m}$).
     - Khung vòm kính đôi mạ vàng kim phát sáng rực rỡ, ở giữa là màn thác nước

trắng xóa đổ thẳng từ $y = +28\text{ m}$ xuống hồ $y = -29.5\text{ m}$.
     - Có **6 cabin thang máy viên nang kính** chạy lên xuống liên tục theo hàm

$\sin(t)$ và dừng đón người chơi khi bấm `E` tại sảnh đáy vực $(0, -110, -29.2)$,
sảnh mặt đất hoặc sảnh đỉnh núi $(0, -135, +28.0)$.

     - Có 3 cầu kính ngang (`Sky-Bridges`) ở $y = -12.5\text{ m}$ (Tầng 4), $y =
+5.5\text{ m}$ (Tầng 8), $y = +23.5\text{ m}$ (Tầng 12) nối thông Cánh Xanh và
Cánh Đỏ.
   4. **KHỐI TÍM & ĐÁY VỰC ($y = -29.2\text{ m}$):**
        - **Ốc đảo tròn Master Dashboard:** Tâm $(0, -10, y = -29.2\text{ m})$, bán

   kính $26\text{ m}$, viền hồ nước tràn ngược vào trong, ở giữa là Cổng Master
   Dashboard và 8 đảo tròn vệ tinh (bán kính $9\text{ m}$ đặt ở khoảng cách $48\text{
   m}$ quanh tâm, nối bằng cầu kính) chứa 8 Zone công cụ + 9 màn hình tương tác.

        - **Bán đảo Sân khấu Nhạc nước (Khung Tím Phải):** Tâm $(+62, -68, y =
   -29.2\text{ m})$, bậc thang đá hình quạt lấn ra mặt hồ, sân khấu `QC Live Stage`
   và bàn DJ.

        - **24 Căn Shophouse Chân Vách Đá:** Xếp dọc theo cung tròn bán kính $118\text{
   m}$ ở nửa Nam và hai bên hẻm núi ($y = -29.2\text{ m}$), mặt tiền 2 tầng rực rỡ
   biển hiệu Neon bán Quần áo, Giày Sneaker, Đồ ăn, Cafe, CLB Bida, kèm đường dạo bộ
   lát gỗ và bến thuyền Kayak tại $(-42, +35, -29.2)$.

        - **2 Tuyến Đường Xe Chạy Xoắn Ốc (Twin Helix Gallery Roads):** Rộng $10\text{
   m}$, có `addPlat` chia 80 đoạn mịn dẫn xe ô tô/xe máy từ đáy vực $( \pm 95, +60,
   -29.2 )$ uốn theo vách núi lên mặt đất $( \pm 145, +120, +2.0 )$ và lên đỉnh núi
   $( \pm 155, -20, +28.0 )$.

   ### 3. NỘI THẤT 12 TẦNG HỌC VIỆN & CHUNG CƯ LUXURY (`js/abyssal_interior.js`)
   - Khi người chơi vào Tháp Thang Máy Vàng (hoặc cửa sảnh Cánh Xanh / Cánh Đỏ) và
   chọn tầng (từ Tầng 1 đến Tầng 12 Học viện, hoặc Căn hộ Thủy cung / Sky Condo /
   Penthouse bên Cánh Đỏ), mở cảnh nội thất cong cánh cung kích thước $48\text{ m}
   \times 26\text{ m}$ có cửa sổ kính cong nhìn ra đúng độ cao thực của hẻm núi và
   màn thác!
   - Bắt buộc dựng đúng 12 kiểu bố trí nội thất khác nhau cho 12 tầng Học viện như đã
   quy hoạch (Tầng 1 Thủy cung Database có cá bơi ngoài kính; Tầng 3 Giảng đường
   ISTQB; Tầng 5 Siêu thị giả lập POS; Tầng 6 Container CI/CD; Tầng 8 bàn 120 điện
   thoại thật + Nap Pods; Tầng 9 ống đồng API + Cafe; Tầng 10 bàn chữ X Playwright +
   Bida; Tầng 11 phòng điều khiển NASA JMeter + Buffet; Tầng 12 bàn Hologram AI + 6
   bàn Bida Carom/Pool).

MODULE 3 PROMPT: ĐỈNH NÚI TỐI THƯỢNG "QA/QC BRAIN CITADEL" &
ĐƯỜNG ĐÈO NGẮM BIỂN (js/brain_citadel.js)

   None‎
   Hãy nâng cấp toàn diện khu vực Đồi Brand QC và Phố Núi cũ thành đại cảnh quan
   "QA/QC BRAIN SOVEREIGN PEAK & OCEANFRONT CORNICHE" trong file
   `js/brain_citadel.js` (thay thế hoặc mở rộng `hills.js`, `monument.js`,
   `mountaintown.js`).

   ### 1. ĐỊA HÌNH NÚI CAO VỌT SÁT ĐẠI DƯƠNG & ĐƯỜNG ĐÈO BIỂN
   - Phạm vi tọa độ: $x \in [+620, +1150]$, $z \in [-100, +450]$.
   - Tâm đỉnh núi `BRAIN_CENTER`: $(880, 180)$, độ cao sân đỉnh phẳng $Y_{\text{top}}
   = +110.0\text{ m}$, bán kính sân đỉnh phẳng $R_{\text{pad}} = 60.0\text{ m}$
   (đường kính $120\text{ m}$, lớn hơn gấp đôi sân cũ).
- Sườn phía Đông ($x > 940$) và phía Nam ($z > 260$) là vách đá dựng đứng lao
thẳng xuống biển đại dương ($y = -6.0\text{ m}$), có dải sóng bạc đầu vỗ ghềnh đá
tung bọt trắng xóa.
- **Tuyến Đường Đèo Vòng Núi Ngắm Biển ("Oceanfront Corniche" - rộng $10\text{
m}$):**

   + Điểm bắt đầu từ cầu nối Thành phố Trên Sông tại $(580, 86, y = +2.0\text{
m})$.

   + Uốn lượn 1.5 vòng quanh quả núi với tổng chiều dài $\approx 1.150\text{ m}$,
độ dốc đều $\approx 9.5\%$ đi qua 3 tầng cảnh quan:

       1. *Đoạn Cầu Cạn Vượt Sóng ($y: +4\text{ m} \rightarrow +38\text{ m}$):* Mặt
đường vươn ra ngoài mặt biển $18\text{ m}$ trên hàng trụ bê tông tròn, bên dưới là
sóng biển và cá voi phun nước.

       2. *Đoạn Hầm Đá Khắc & Phố Săn Mây ($y: +38\text{ m} \rightarrow +76\text{
m}$):* Đường đi xuyên qua 3 cổng vòm đá tự nhiên, dọc mép vực biển đặt **12 Hàng
Quán Săn Mây Kiến Trúc Độc Bản** (Lầu trà đạo 3 tầng mái lưu ly, Quán Bistro hang
đá 500 đèn lồng đỏ, Quán Cafe 3 vòm cầu kính Geodesic, Nhà hàng Hải sản hình con
thuyền gỗ trên vách đá, CLB Bida & Craft Beer mặt kính đen...). Mỗi quán có bàn
ghế ngồi ngắm biển (`W.addSeat`) và thực đơn gọi món (`W.INTER`).

       3. *Đoạn Cầu Kính Cổng Trời ($y: +76\text{ m} \rightarrow +110\text{ m}$):*
Bắc qua khe vực sâu bằng cây cầu dây văng đáy kính dài $95\text{ m}$ dẫn thẳng vào
Quảng trường Đỉnh Mây.

### 2. KIẾN TRÚC "QA/QC BRAIN CITADEL" (QUY MÔ GẤP ĐÔI - ĐỈNH CAO $y = +168\text{
m}$)
- Tâm tòa đài: $(880, 180, y = +110.0\text{ m})$. Đi bộ thẳng vào không cần chuyển
cảnh.
- **Kích thước:** Bán kính thân đài $R_B = 28.0\text{ m}$ (đường kính $56\text{
m}$), bán kính giếng trời thông tầng $R_A = 10.0\text{ m}$, gồm **6 tầng** (mỗi
tầng cao $8.0\text{ m}$, cao độ sàn: $+110, +118, +126, +134, +142, +150\text{
m}$).
- **Vỏ Kiến Trúc "Đài Liên Hoa Thần Kinh" (Levitating Neural Lotus):**

   + Bao quanh thân đài là **8 Cánh Hoa Sen Khổng Lồ** dựng bằng `ExtrudeGeometry`
uốn cong vươn từ $y = +110\text{ m}$ lên $y = +154\text{ m}$, khung viền vàng kim
phát sáng và mặt kính xanh ngọc trong suốt.

   + Giữa giếng trời là **Cầu Thang Xoắn Đôi Hình Chuỗi ADN (Double-Helix
Staircases)** gồm 2 nhánh thang xoắn đối xứng nhau $180^\circ$ nối từ tầng 1 lên
tầng 6, kèm thêm **2 Thang Máy Kính Tốc Độ Cao** cho người muốn lên nhanh.
- **Đỉnh Biểu Tượng ($y = +155\text{ m} \rightarrow +168\text{ m}$):**

   + **3 Vòng Kim Loại Vàng (Gyroscope Rings)** bán kính $17\text{ m}, 15\text{ m},
13\text{ m}$ quay quanh 3 trục $X, Y, Z$.

   + Ở tâm là **Khối Não Bộ Pha Lê Đa Diện Khổng Lồ** ($18\text{ m} \times 15\text{
m} \times 22\text{ m}$) phát xung ánh sáng tím -- xanh lam chạy dọc các nơ-ron
thần kinh và bộ chữ 3D mạ vàng **`QA · QC · QE`** xoay ở $y = +166\text{ m}$ cùng
8 cột sáng chiếu thẳng lên bầu trời đêm.
- **Nội thất 6 Tầng:**

   + *Tầng 1 ($+110\text{ m}$):* Bảo tàng Lịch sử Kiểm thử & Mô hình 3D các thảm
họa phần mềm (Tên lửa Ariane 5, Tàu Mars Orbiter, Con bọ 1947).
       + *Tầng 2 ($+118\text{ m}$):* Đấu trường Kỹ thuật Test Design & 6 Kiosk Quiz
   QA/QC.

       + *Tầng 3 ($+126\text{ m}$):* Trung tâm Chỉ huy Hiệu năng & Bảo mật Toàn cầu
   (Quả cầu Hologram mạng thế giới ở sảnh Bắc).

       + *Tầng 4 ($+134\text{ m}$):* Đại sảnh Danh vọng & Phòng Bí Ẩn Đa Chiều (cửa
   trượt phát sáng mở vào không gian giải đố kiến trúc).

       + *Tầng 5 ($+142\text{ m}$):* Nhà hàng Xoay $360^\circ$, Sky Bar và **Phòng Bida
   Hoàng Gia** (4 bàn Bida mạ vàng nhìn ra biển mây).

       + *Tầng 6 ($+150\text{ m}$ - Sân thượng):* Trạm Siêu Máy Tính **QA Brain Core**
   (bấm `E` mở công cụ phân tích tài liệu $\rightarrow$ sinh Test Case) + 6 ống nhòm
   ngắm toàn cảnh thế giới.

   ### 3. SÂN BAY ĐỈNH MÂY & KHU VUI CHƠI CẢM GIÁC MẠNH TRÊN ĐỈNH VỰC
   - **Sân bay Đỉnh Mây (Brain Skyport):** Nằm trên bệ dầm thép vươn ra phía Bắc đỉnh
   núi tại $x \in [820, 980], z \in [50, 105], y = +108\text{ m}$ gồm đường băng STOL
   dài $160\text{ m}$, 2 bãi đáp trực thăng và nhà ga kính đón các chuyến bay từ Sân
   bay QA/QC.
   - **Khu Vui Chơi Trên Mây (Phía Nam đỉnh núi $z \in [245, 310], y = +108\text{
   m}$):**

       1. **Xích Đu Tử Thần Vượt Vực (Cliff-Edge Giant Swing tại $(880, 265, +108)$):**
   Khung vòm cao $28\text{ m}$ đặt sát mép vực biển; bấm `E` ngồi vào ghế, xích đu
   văng góc $110^\circ$ đưa người chơi bay lơ lửng ra ngoài khoảng không trên mặt
   biển sâu $110\text{ m}$!

       2. **Khinh Khí Cầu Ngắm Hoàng Hôn (tại $(925, 250, +108)$):** Bấm `E` bay lên
   cao độ $y = +210\text{ m}$ ngắm trọn toàn bộ 8 phân khu của thế giới.

MODULE 4 PROMPT: THÀNH PHỐ TRÊN SÔNG & 5 TRỤ SỞ BIG TECH
QA/QC (js/river_cbd.js & js/bigtech_interiors.js)

   None‎
   Hãy tạo file `js/river_cbd.js` và `js/bigtech_interiors.js` để xây dựng "RIVER
   TECH CBD" (Thành phố Trên Sông mang vẻ đẹp Bắc Kinh CBD rực rỡ ánh đèn) tại vùng
   tọa độ $x \in [+180, +580], z \in [-120, +460]$.

   ### 1. QUY HOẠCH KÊNH ĐÀO, CẦU & ĐÔ THỊ TRÊN SÔNG (`js/river_cbd.js`)
   - Chia mặt bằng thành 4 hòn đảo đô thị ngăn cách bởi 1 dòng sông chính (chảy từ
   cửa vực QA/QC Island dọc theo $z = +110$) và 2 kênh đào Bắc -- Nam (tại $x = 365$
   và $x = 510$).
   - Dựng bờ kè đá granite có lan can đèn LED vàng kim, đường dạo bộ ven sông trồng
   liễu và 12 cây cầu (cầu vòm thép đỏ, cầu kính 2 tầng, cầu đi bộ phát sáng).
   - Qui định bất động sản: Trong khu vực này chỉ bán **Căn hộ Chung cư Cao tầng** (4
   tòa tháp "Beijing Starlight Towers" cao 28 tầng tại $x \in [210, 340], z \in [260,
   360]$; người chơi bấm `E` ở sảnh để mua căn hộ tầng cao hoặc lên Penthouse).
- Giữ đầy đủ và nâng cấp ngoại thất cho Bệnh viện Đa khoa, Trạm Cứu hỏa Thủy --
Bộ, Trường học và Trung tâm Việc làm.

### 2. NĂM TÒA NHÀ BIỂU TƯỢNG QA/QC (NGOẠI THẤT ĐỘC ĐÁO & NỘI THẤT KHÁC NHAU 100%)
Hãy dựng ngoại thất 3D chi tiết trên mặt đảo sông và đăng ký vào hệ thống nội thất
`bigtech_interiors.js` sao cho mỗi tòa có mặt bằng phòng, cách xếp bàn ghế, phòng
học, phòng họp, phòng ăn, phòng bida và phòng Giám đốc hoàn toàn riêng biệt:
1. **The Infinite Loop QA Ring (Tâm $(280, -30)$, bán kính ngoài $55\text{ m}$,
bán kính sân vườn trong $30\text{ m}$, cao $24\text{ m}$ - Kiểu Apple Park):**

     - Ngoại thất hình nhẫn tròn bằng kính cong và mái bạc, ở giữa là công viên cây
xanh và nhà vòm kính.

     - Nội thất: Sàn phòng cong hình vành khuyên, bàn gỗ Sồi dài $8\text{ m}$ xếp
hướng tâm, phòng họp dạng buồng kính tròn lơ lửng, phòng Giám đốc nhìn bao quát
$180^\circ$ ra vườn trong và sông ngoài.
2. **Dragonscale Auto-Labs (Tâm $(440, -20)$, $90\text{ m} \times 70\text{ m}$,
cao $28\text{ m}$ - Kiểu Google Bay View):**

     - Ngoại thất mái lượn sóng hình vảy rồng bạc.
     - Nội thất: Không gian 2 tầng mở có cầu trượt xoắn từ tầng 2 xuống tầng 1, xe
Cafe cổ, sân bóng rổ mini trong nhà, bàn làm việc hình tổ ong lục giác, phòng họp
lều Glamping, gác lửng Giám đốc có bàn Bida.
3. **Silicon Forest & Treehouse Hub (Tâm $(290, 160)$, $85\text{ m} \times
75\text{ m}$ - Kiểu Microsoft Campus):**
     - Ngoại thất 4 khối nhà gỗ -- kính có 6 cây cổ thụ mọc xuyên từ mặt sông lên
mái.
     - Nội thất: Có dòng suối chảy dưới sàn kính giữa phòng làm việc, 3 phòng họp là
Ngôi nhà trên cây (Treehouses) ở độ cao $+8\text{ m}$ nối bằng cầu treo gỗ, phòng
Giám đốc trên vườn mái.
4. **The Tri-Matrix Perf Center (Tâm $(450, 170)$, Kim tự tháp tam giác cạnh
$85\text{ m}$, cao $38\text{ m}$ - Kiểu NVIDIA Voyager):**
     - Ngoại thất khối tam giác cắt vát với giếng trời phát sáng xanh lá.
     - Nội thất: Đại cầu thang tam giác ở tâm làm khán đài Tech Talk, các dãy bàn 3
màn hình xếp theo tam giác đồng tâm, phòng Giám đốc ở đỉnh chóp tam giác.
5. **Cantilever Cyber Twin-Tower (Tâm $(370, 340)$, cao $120\text{ m}$ - Kiểu CCTV
Bắc Kinh / Tencent):**
     - Ngoại thất 2 tháp nghiêng mọc từ 2 bờ kênh đào và nối liền nhau bằng khối cầu
ngang ở độ cao $+95\text{ m}$.
     - Nội thất tầng cầu nối: Sàn kính nhìn thẳng xuống dòng sông bên dưới, chứa Đại
phòng họp Hội đồng Quản trị, CLB Bida Thượng lưu và Phòng Chủ tịch.
MODULE 5 PROMPT: DEV CITY -- ĐÔ THỊ NÚI 8D KIỂU TRÙNG KHÁNH
(js/devcity_chongqing.js)

   None‎
   Hãy tạo file `js/devcity_chongqing.js` để xây dựng "DEV CITY" tại phía Bắc bản đồ
   ($x \in [+100, +850], z \in [-950, -120]$) theo phong cách Đô thị Núi 8D Trùng
   Khánh xa hoa, hiểm trở và đầy đủ dịch vụ.

   ### 1. ĐỊA HÌNH 4 THỀM ĐỘ CAO & GIAO THÔNG ĐA TẦNG
   - Thiết kế hàm địa hình phân thành 4 thềm độ cao rõ rệt nối bằng đường đèo, cầu
   vượt và hầm xuyên núi:

       + Thềm 1 ($z \in [-220, -120], y = +2.0\text{ m}$): Bờ sông Bắc và bến du
   thuyền.

       + Thềm 2 ($z \in [-450, -220], y = +24.0\text{ m}$): Khu thương mại sườn núi,
   Bệnh viện Sơn Thành, Trạm cứu hỏa, Trường học.

       + Thềm 3 ($z \in [-720, -450], y = +52.0\text{ m}$): Trung tâm cao ốc Dev City
   và **Công Viên Hồ Thiên Cảnh Giữa Núi** (hồ nước rộng $140\text{ m} \times
   90\text{ m}$ nằm ở độ cao $+52\text{ m}$ có đảo xanh ở giữa).

       + Thềm 4 ($z \in [-950, -720], y = +85.0\text{ m}$): Sân bay Đỉnh núi Dev City
   và Quần thể Chùa Linh Sơn Vân Tự.
   - **3 Công Trình Giao Thông Biểu Tượng:**

       1. **Tuyến Tàu Điện Xuyên Lầu (Liziba Monorail):** Đường ray trên cao xuất phát
   từ QA/QC Island, vượt qua Cầu Dây Văng Đôi $(220, -120)$, lượn dọc sườn núi và
   **chui xuyên qua tầng 6--8 của tòa nhà 18 tầng "Dev Residency Tower" tại $(380,
   -420, y = +38\text{ m})$** (khoét rỗng giữa tòa nhà làm sân ga đón khách, đoàn tàu
   4 toa sơn màu xanh -- tím -- cam chạy qua mỗi $35\text{ s}$).

       2. **Nút Giao Thông Xoắn Ốc 5 Tầng Trên Cao (Sujiaba Interchange tại $(280,
   -310)$):** Đường cầu cạn xoắn tròn bán kính $36\text{ m}$ nâng xe từ Thềm 1 ($y =
   +2\text{ m}$) lên Thềm 3 ($y = +52\text{ m}$) trên các trụ bê tông cao vút.

       3. **Hầm Đường Bộ Đôi Xuyên Núi Đá:** Khoét qua vách núi tại $x = 450, z \in
   [-520, -430]$ với đèn vòm LED xanh.

   ### 2. CÁC QUẦN THỂ KIẾN TRÚC TRONG DEV CITY
   1. **Tổ Hợp Tháp Chân Trời Ngang "DEV RAFFLES SKY-CRYSTAL" ($x \in [420, 560], z
   \in [-260, -180]$):**

        - 4 tòa tháp cong như cánh buồm cao $115\text{ m}$ đứng ở mũi sông, trên đỉnh
   tại độ cao $y = +95\text{ m}$ đặt một **Ống Kính Nằm Ngang (The Crystal
   Skybridge)** dài $140\text{ m}$, rộng $24\text{ m}$ vắt qua cả 4 tháp.

        - Bên trong dạy các khóa lập trình Dev (Backend, Frontend, System Design,
   DevOps, AI) và trên ống kính đỉnh là Vườn nhiệt đới, Hồ bơi vô cực trên không, Đài
   quan sát đáy kính.
   2. **Phố Cổ Treo Vách Đá 11 Tầng "HỒNG NHAI ĐỘNG" ($x \in [150, 250], z \in [-250,
   -180], y: +2\text{ m} \rightarrow +46\text{ m}$):**

        - 11 tầng nhà sàn gỗ mái đao cong bám vào vách núi bên sông, treo hàng trăm đèn
   lồng đỏ -- vàng rực sáng ban đêm, có cầu thang bộ đi xuyên từ bờ sông ($y =
   +2\text{ m}$) lên đại lộ trên núi ($y = +46\text{ m}$), bán Lẩu cay Trùng Khánh,
   Mì kéo sợi, Trà đạo.
   3. **Quần Thể Chùa Tâm Linh "LINH SƠN VÂN TỰ" ($x \in [680, 820], z \in [-820,
   -640], y: +65\text{ m} \rightarrow +125\text{ m}$):**

        - Nối qua vực bằng Cầu Treo Xích Sắt dài $80\text{ m}$.
        - Gồm: Cổng Tam Quan Đá trên mây, **Bảo Tháp Bát Giác 9 Tầng** cao $54\text{
   m}$ mái cong (dùng `buildAsianCurvedRoof`), **Đại Hùng Bảo Điện** dựng nửa trong
   hang đá nửa trên cột gỗ vươn ra vực, và **Tượng Phật Vàng** cao $32\text{ m}$ trên
   đỉnh núi có mây trôi quanh chân.

MODULE 6 PROMPT: ĐẢO NGOẠI NGỮ THỤY SĨ 4 THỨ TIẾNG
(js/swiss_lang_island.js)

   None‎
   Hãy nâng cấp file `js/langcenter.js` thành `js/swiss_lang_island.js` để mở rộng
   Đảo Ngoại Ngữ tại $x \in [-850, -250], z \in [-500, +250]$ theo mô hình "Thảo
   Nguyên Thụy Sĩ Mộng Mơ (Swiss Alpine Eden)" với 4 ngôn ngữ (Anh, Trung, Nhật, Hàn)
   và mở thông toàn bộ nội thất.

   ### 1. ĐỊA HÌNH THẢO NGUYÊN THỤY SĨ & HẠ TẦNG DU LỊCH
   - Phía Bắc đảo ($z \in [-500, -340]$) là dãy **Núi Tuyết Jungfrau** cao $+95\text{
   m}$ có chóp tuyết trắng, thác nước đổ xuống thành dòng **Suối Băng Pha Lê** chảy
   uốn lượn qua những ngọn đồi cỏ xanh mượt nhấp nhô nhẹ ($y \in [+2\text{ m},
   +16\text{ m}]$) phủ đầy hoa vàng/tím, cối xay gió gỗ và đàn bò sữa đeo chuông.
   - **Tuyến Tàu Hỏa Bánh Răng Đỏ (Swiss Red Cogwheel Train):** Chạy khép kín vòng

 ������ quanh đảo qua cầu cạn đá vòm cổ điển, có 5 ga dừng (Ga Cầu Vòm, Ga Tiếng Anh, Ga

   Tiếng Trung, Ga Tiếng Nhật, Ga Tiếng Hàn & Làng Tuyết), vé `5 ` hoặc miễn phí
   cho học viên.
   - **Bến Thủy Phi Cơ & Sân Bay Thảo Nguyên** tại $(-320, +160)$ + **Làng Du Lịch
   Thụy Sĩ** tại $(-550, +80)$ (Nhà hàng Lẩu Phô mai Fondue, Tiệm Sô-cô-la, Tiệm Đồng
   hồ).

   ### 2. BỐN QUẦN THỂ HỌC VIỆN NGÔN NGỮ (ĐI BỘ VÀO TRONG HỌC TRỰC TIẾP)
   1. **Học Viện Tiếng Anh - "Oxford Castle & Royal Glasshouse" (Tâm $(-420, -80)$,
   $50\text{ m} \times 36\text{ m}$):**

        - Ngoại thất đá cổ điển kèm Tháp đồng hồ Big Ben cao $38\text{ m}$ và vườn hồng
   nhà kính.

        - Đi bộ qua cửa chính vào Đại sảnh Oxford (bàn gỗ dài, kệ sách 3 tầng, phòng
   học từ $0 \rightarrow \text{IELTS } 8.0+$, phòng Speaking Club và British Tea
   Room).
   2. **Học Viện Tiếng Trung - "Hán Học Điện & Cô Tô Thủy Các" (Tâm $(-680, -80)$,
   $50\text{ m} \times 38\text{ m}$):**

        - Ngoại thất Cung điện mái ngói lưu ly vàng -- đỏ nổi trên hồ sen, nối bằng Cầu
   Cửu Khúc 9 nhịp và rừng trúc.

        - Bên trong mở thông Chánh điện Hán ngữ, bàn thư pháp, lớp học $0 \rightarrow
   \text{HSK } 7-9$ và Trà quán Giang Nam.
   3. **Học Viện Tiếng Nhật (MỚI) - "Kyoto Sakura Castle & Zen Pavilion" (Tâm $(-420,
   -280)$, $52\text{ m} \times 40\text{ m}$):**

        - Ngoại thất Lâu đài gỗ Tuyết tùng 3 tầng mái cong, phía trước là **Cổng Torii
   Đỏ Khổng Lồ** đứng dưới mặt hồ, cầu gỗ đỏ và **40 cây Hoa Anh Đào (Sakura)** màu
   hồng phấn có hiệu ứng cánh hoa rơi trong gió (`Points` particle).

        - Bên trong: Phòng học sàn chiếu Tatami cửa trượt Shoji, phòng Lab luyện nghe
   JLPT $\text{N5} \rightarrow \text{N1}$, góc Trà đạo Matcha và quầy Ramen/Sushi.
   4. **Học Viện Tiếng Hàn (MỚI) - "Gyeongbokgung Hanok & Seoul K-Cube" (Tâm $(-680,
   -280)$, $52\text{ m} \times 40\text{ m}$):**

        - Ngoại thất kết hợp Lầu cổ Hanok mái ngói Dancheong trên hồ đá và khối nhà
   kính hiện đại gắn màn hình LED K-Wave, bao quanh bởi hàng cây Ngân hạnh (Ginkgo)
   lá vàng rực.

        - Bên trong: Lớp học $\text{Hangul} \rightarrow \text{TOPIK I & II}$, studio
   luyện hội thoại công sở Hàn Quốc và khu lều Pocha ẩm thực Hàn.

MODULE 7 PROMPT: ỐC ĐẢO LẤN BIỂN "THE QC PALM DUBAI"
(js/palm_dubai.js)

   None‎
   Hãy tạo file `js/palm_dubai.js` để xây dựng kỳ quan lấn biển "THE QC PALM DUBAI"
   tại vùng biển phía Đông Nam ($x \in [+250, +1050], z \in [+520, +1320]$, tâm đảo
   tại $(650, 920)$) với quy hoạch đô thị đồng nhất theo từng phân khu giá.

   ### 1. HÌNH HỌC ĐẢO CỌ LẤN BIỂN (`SDF & Heightmap`)
   - Tâm đảo Cọ: $(650, 920)$, mặt đảo phẳng ở $y = +2.2\text{ m}$ có bờ kè đá trắng
   và bãi cát mịn thoai thoải xuống làn nước biển xanh ngọc bích.
   - **Thân Cọ Trung Tâm (The Trunk):** Chạy dọc trục $x \in [595, 705]$ (rộng
   $110\text{ m}$), từ $z = 520$ đến $z = 940$ (dài $420\text{ m}$), nối với đất liền
   phía Bắc qua **Cầu Dây Văng Palm Gateway** dài $60\text{ m}$ ($z: 460 \rightarrow
   520$) và tuyến tàu điện **Palm Monorail** chạy dọc giữa thân đảo ra tới đỉnh Vành
   Trăng Khuyết.
   - **8 Nhánh Lá Cọ (8 Fronds - 4 nhánh Tây $F_1, F_3, F_5, F_7$ và 4 nhánh Đông
   $F_2, F_4, F_6, F_8$):**

       + Tỏa ra đối xứng hai bên Thân Cọ tại các mốc $z = 640, 720, 800, 880$, uốn cong
   nhẹ về phía Nam, mỗi nhánh dài $240\text{ m}$, rộng $46\text{ m}$, giữa các nhánh
   là kênh biển xanh rộng $34\text{ m}$ cho du thuyền chạy vào tận cửa nhà.
   - **Vành Trăng Khuyết Bao Quanh (The Outer Crescent):** Vòng cung bán kính trong
   $340\text{ m}$, bán kính ngoài $405\text{ m}$ (rộng $65\text{ m}$) ôm trọn lấy các
   nhánh lá từ góc $-\pi \cdot 0.82$ đến $+\pi \cdot 0.82$.

   ### 2. QUY HOẠCH ĐỒNG NHẤT 100% THEO TỪNG PHÂN KHU
   1. **Trên Thân Cọ (The Trunk):**
        - Chỉ xây dựng **Phố Ẩm Thực Biển, 6 Beach Club có hồ bơi sát biển, Trung tâm

 ������ Thương mại Marina Mall** và **4 Tòa Chung Cư Biển Cao Tầng (Palm Sky-Towers, cao

   18 tầng, giá căn hộ `8.000 - 18.000 `)**.

 ������2. **Nhánh 1 & Nhánh 2 ($z \approx 640$ - Khu Nhà Giá Rẻ Khởi Nghiệp - Giá `2.500
       /căn`):**
        - Gồm 24 căn **Santorini Starter Townhouses** ($8\text{ m} \times 10\text{ m}$,
   2 tầng, tường trắng mái vòm xanh dương) giống hệt nhau xếp đều hai bên đường cọ;
   bên trong đầy đủ sofa, bếp, giường ngủ tầng 2 và 3 luống rau trước sân.

 ������3. **Nhánh 3 & Nhánh 4 ($z \approx 720$ - Khu Nhà Phố Thượng Lưu - Giá `12.000
       /căn`):**
        - Gồm 18 căn **Modern Glass Duplex** ($12\text{ m} \times 14\text{ m}$, 2 tầng
   + sân thượng BBQ), ốp đá kem và gỗ Teak, có gara đỗ xe và **hồ bơi nhỏ Plunge
   Pool** bên hông; nội thất thông tầng có đèn chùm vàng.

 ������ 4. **Nhánh 5 & Nhánh 6 ($z \approx 800$ - Khu Biệt Thự Đơn Lập Hồ Bơi - Giá

   `35.000 /căn`):**
        - Gồm 12 căn **Tropical Luxury Pool Villas** ($18\text{ m} \times 20\text{ m}$,

   2 tầng), sân sau có **hồ bơi tràn bờ $10\text{ m} \times 4\text{ m}$ sát mặt
   biển**, ghế tắm nắng, nội thất đá Marble trắng, **có bàn Bida riêng trong phòng
   giải trí** và **1 NPC Quản gia** đứng chào ở cửa.

 ������ 5. **Nhánh 7 & Nhánh 8 ($z \approx 880$ - Khu Siêu Biệt Thự Bến Du Thuyền - Giá

   `85.000 /căn`):**
        - Gồm 8 căn **Super Yacht Mansions** ($26\text{ m} \times 28\text{ m}$, 3 tầng

   kính консоl), có **hồ bơi vô cực chữ L kèm quầy Bar chìm**, **bến đậu Ca-nô / Du
   thuyền riêng sau nhà**, Gara kính trưng bày 2 siêu xe, rạp phim tại gia, 2 NPC
   Quản gia & Đầu bếp riêng.

 ������ 6. **Trên Vành Trăng Khuyết (The Crescent - Khu Siêu Siêu Cấp Biệt Thự Đế Vương -

   Giá `250.000 /căn`):**
        - Gồm **5 Dinh Thự Đế Vương (Sovereign Billionaire Palaces)** diện tích

   $50\text{ m} \times 45\text{ m}$ mỗi căn, 3 tầng nổi + **1 tầng ngầm Thủy cung
   dưới biển**.

        - Mỗi dinh thự có: Cổng gác Vệ sĩ riêng, **Bãi đáp Trực thăng trên mái**, **Bến
   đậu Siêu Du Thuyền $24\text{ m}$**, **Hồ bơi vô cực kép (tầng 1 & hồ đáy kính tầng
   3)**, Gara bàn xoay 4 siêu xe, Phòng Bida & Cigar ngầm dưới biển, cùng **5 NPC
   phục vụ riêng** (Quản gia trưởng, Đầu bếp Michelin, Vệ sĩ, Tài xế Limo, Thuyền
   trưởng).
   - Lưu trạng thái sở hữu vào `S.ownedEstates` (cho phép người chơi giàu có mua
   nhiều bất động sản ở các phân khu khác nhau mà không bị ghi đè mất nhà cũ!).

MODULE 8 PROMPT: HỆ THỐNG 4 SÂN BAY THẬT & 55 LOẠI BOT AI
(js/skyport.js & js/bots_v2.js)

   None‎
   Hãy tạo 2 file `js/skyport.js` và `js/bots_v2.js` để kết nối hàng không toàn thế
   giới và thổi hồn sự sống vào mọi ngóc ngách đô thị.
### 1. HỆ THỐNG HÀNG KHÔNG 4 SÂN BAY (`js/skyport.js`)
- Dựng 4 Sân bay tại 4 phân khu:

   1. **Sân bay Quốc tế QA/QC (`QA/QC International Airport`):** Tại $x \in [-180,
+240], z \in [+220, +380], y = +4.0\text{ m}$. Gồm Nhà ga mái vòm cánh cá đuối
$160\text{ m} \times 75\text{ m}$ (có thác nước Jewel Changi ở giữa sảnh, quầy
Check-in, phòng chờ VIP có bàn Bida), Đài Không lưu ATC cao $68\text{ m}$, và 2
đường băng nổi dài $420\text{ m}$ có đèn dẫn đường nhấp nháy.

   2. **Sân bay Đỉnh Núi Dev City (`Chongqing Tabletop Airport`):** Tại $x \in
[350, 650], z \in [-920, -780], y = +85.0\text{ m}$.

   3. **Sân bay Đỉnh Mây Brain (`Brain Skyport`):** Tại $x \in [820, 980], z \in
[50, 105], y = +108.0\text{ m}$.

   4. **Sân bay Thảo Nguyên & Thủy Phi Cơ Ngoại Ngữ (`Alpine Seaplane &
Airfield`):** Tại $x \in [-360, -250], z \in [+110, +240], y = +2.5\text{ m}$.
- **Cơ chế Chuyến Bay Thực Tế (Real Flight Spline & Cutscene):**

������ ������ + Khi người chơi bấm `E` tại cổng Boarding và chọn điểm đến (Vé Phổ thông `25
   ` / Thương gia `80 `), nhân vật bước qua ống lồng vào khoang máy bay phản lực
`QC Airlines`, ngồi vào ghế cạnh cửa sổ.

   + Máy bay chạy đà dọc đường băng (tăng tốc lên $45\text{ m/s}$), ngóc mũi
$15^\circ$ cất cánh bay vọt lên tầng mây ($y = +240\text{ m}$) theo đường cong
`CatmullRomCurve3` nối tới sân bay đích (người chơi xoay chuột ngắm toàn cảnh núi
sông, thành phố và biển từ cửa sổ máy bay, hoặc bấm `X` để hạ cánh nhanh), sau đó
đáp xuống đường băng đích êm ái!

### 2. HỆ THỐNG 55 LOẠI BOT SỐNG ĐỘNG (`js/bots_v2.js`)
- Sử dụng kho nhân vật `W.people` kết hợp gắn đạo cụ vào xương tay (`RightHand` /
`LeftHand`) và tối ưu hiệu năng bằng Frustum/Distance Culling (chỉ cập nhật
animation khi cách người chơi $< 85\text{ m}$).
- Triển khai đầy đủ 55 hành vi chuyên biệt theo danh sách quy hoạch:

   + Công nhân lau kính trên sàn treo Gondola trượt dọc mặt kính tòa tháp.
   + Cơ thủ Bida cúi người nhắm bắn bi chạy trên bàn.
   + Thợ lặn bơi ngoài vách kính tầng ngầm thủy cung vẫy chào người trong phòng
Database.
   + Quản gia trưởng cúi chào $30^\circ$, Đầu bếp Michelin áp chảo bốc lửa, Vệ sĩ
kính đen, Nhân viên vớt lá hồ bơi tại các biệt thự Đảo Palm Dubai.
   + Cơ trưởng, Tiếp viên hàng không, Nhân viên vẫy 2 gậy đèn LED điều hướng máy
bay trên đường băng.
   + Đoàn khách du lịch đứng giơ máy ảnh chụp khoảnh khắc tàu điện lao xuyên qua
bụng tòa chung cư ở Dev City.
   + Sư thầy quét lá ngân hạnh và thỉnh chuông đồng ở Chùa Linh Sơn Vân Tự.
   + Giảng viên Anh -- Trung -- Nhật (mặc Kimono) -- Hàn và nghệ nhân thổi kèn
Alphorn trên thảo nguyên Đảo Ngoại Ngữ.
