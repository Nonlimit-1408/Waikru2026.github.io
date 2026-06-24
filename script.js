// =========================================
// 1. ระบบ Scale Wrapper (ซูมหน้าจออัตโนมัติ)
// =========================================
function resizeApp() {
    const wrapper = document.getElementById('scale-wrapper');
    if (!wrapper) return;

    const targetWidth = 1080;
    const targetHeight = 2000; 

    let scale = Math.min(
        (window.innerWidth * 0.95) / targetWidth,
        (window.innerHeight * 0.95) / targetHeight
    );

    wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

window.addEventListener('resize', resizeApp);

// =========================================
// 2. ระบบเสียง (Audio System)
// =========================================
// โหลดไฟล์เสียง (ถ้าไฟล์คุณนามสกุลอื่นเช่น .wav ก็แก้ตรงนี้ได้เลย)
const randomSound = new Audio('random.mp3'); 
randomSound.volume = 0.4; // เซ็ตความดัง 40% ตามที่ต้องการ


// =========================================
// 3. ระบบสุ่มพานและบทกลอน (Fast Slideshow)
// =========================================
const randomBtn = document.getElementById('randomBtn');
const saveBtn = document.getElementById('saveBtn');
const poemText = document.getElementById('poemText');
const offeringImage = document.getElementById('offeringImage');

let isRandomizing = false;

// แยกโค้ดสุ่มออกมาเป็นฟังก์ชัน เพื่อให้ใช้ได้ทั้งตอนเปิดเว็บและตอนกดปุ่ม
function startRandomizer(playSound = true) {
    if (isRandomizing) return;
    
    // เช็คว่าโหลดข้อมูลมาครบไหม
    if (typeof poems === 'undefined' || typeof phanImages === 'undefined') {
        if (playSound) alert("⚠️ ยังไม่ได้เชื่อมไฟล์ข้อมูล poems.js และ assetbase64.js ครับ!");
        return;
    }

    isRandomizing = true;
    randomBtn.disabled = true;
    saveBtn.disabled = true;

    // เล่นเสียงเฉพาะตอนกดปุ่ม
    if (playSound) {
        randomSound.currentTime = 0; // รีเซ็ตเสียงให้เริ่มจาก 0 เสมอ
        // ใส่ catch กันเหนียวไว้ เผื่อเบราว์เซอร์บล็อกเสียง จะได้ไม่ Error แดง
        randomSound.play().catch(err => console.log("Audio autoplay prevented: ", err));
    }

    let counter = 0;
    const maxTicks = 20; 
    const speed = 70; // 20 รอบ * 70ms = ใช้เวลาประมาณ 1.4 วินาที (เข้ากับเสียง 2 วิพอดี)

    const shuffleInterval = setInterval(() => {
        const randomPoemIndex = Math.floor(Math.random() * poems.length);
        const randomImageIndex = Math.floor(Math.random() * phanImages.length);

        poemText.innerHTML = poems[randomPoemIndex];
        offeringImage.src = phanImages[randomImageIndex];

        counter++;
        
        // เมื่อสุ่มครบจำนวนรอบแล้ว (แอนิเมชันหยุด)
        if (counter >= maxTicks) {
            clearInterval(shuffleInterval);
            
            // ✂️ สั่งตัดเสียงทันที ไม่สนว่าเล่นจบหรือยัง
            if (playSound) {
                randomSound.pause();        // สั่งหยุดเล่น
                randomSound.currentTime = 0; // คืนค่ากลับไปจุดเริ่มต้น
            }
            
            // สุ่มรอบสุดท้ายเพื่อแสดงผลจริง
            const finalPoemIndex = Math.floor(Math.random() * poems.length);
            const finalImageIndex = Math.floor(Math.random() * phanImages.length);
            
            poemText.innerHTML = poems[finalPoemIndex];
            offeringImage.src = phanImages[finalImageIndex];

            isRandomizing = false;
            randomBtn.disabled = false;
            saveBtn.disabled = false;
        }
    }, speed);
}

// เมื่อกดปุ่ม "สุ่มใหม่" -> ให้สุ่มและเล่นเสียง (true)
randomBtn.addEventListener('click', () => {
    startRandomizer(true); 
});

// ทำงานทันทีเมื่อโหลดหน้าเว็บเสร็จ
window.addEventListener('DOMContentLoaded', () => {
    resizeApp();
    // สุ่มครั้งแรกทันทีที่เปิดเว็บ (ส่งค่า false ไปเพื่อไม่ให้มีเสียง)
    setTimeout(() => {
        startRandomizer(false);
    }, 150); // ดีเลย์นิดนึงให้ภาพโหลดเข้า Canvas ให้เรียบร้อย
});


// =========================================
// 4. ระบบเซฟการ์ดเป็นรูปภาพ (html2canvas)
// =========================================
saveBtn.addEventListener('click', async () => {
    const cardElement = document.getElementById('scrapbook-card');
    
    if (typeof html2canvas === 'undefined') {
        alert("⚠️ กรุณาติดตั้ง Library 'html2canvas' ในไฟล์ index.html ก่อนครับ!");
        return;
    }

    const originalText = saveBtn.innerText;
    saveBtn.innerText = "กำลังบันทึก...";
    saveBtn.disabled = true;
    randomBtn.disabled = true;

    // สร้างกล่องจำลอง (Export Container)
    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.top = '0';
    exportContainer.style.left = '0';
    exportContainer.style.zIndex = '-100'; 
    exportContainer.style.width = '1080px';
    exportContainer.style.height = '1920px';
    exportContainer.style.backgroundColor = 'transparent'; 
    exportContainer.style.display = 'flex';
    exportContainer.style.justifyContent = 'center';
    exportContainer.style.alignItems = 'center';

    const clonedCard = cardElement.cloneNode(true);
    
    // HACK: แก้บัก html2canvas ขอบเขียวปลิ้น
    clonedCard.style.border = 'none'; 
    clonedCard.style.backgroundColor = '#4d1f0f'; 
    clonedCard.style.boxShadow = 'none'; 

    const darkGreenLayer = document.createElement('div');
    darkGreenLayer.style.width = '908.5px';
    darkGreenLayer.style.height = '1665.7px';
    darkGreenLayer.style.backgroundColor = '#007a6d'; 
    darkGreenLayer.style.borderRadius = '22px'; 
    
    darkGreenLayer.style.display = 'flex';
    darkGreenLayer.style.justifyContent = 'center';
    darkGreenLayer.style.alignItems = 'center';

    while (clonedCard.firstChild) {
        darkGreenLayer.appendChild(clonedCard.firstChild);
    }
    clonedCard.appendChild(darkGreenLayer);

    exportContainer.appendChild(clonedCard);
    document.body.appendChild(exportContainer);

    await new Promise(resolve => setTimeout(resolve, 150));

    try {
        const canvas = await html2canvas(exportContainer, {
            scale: 1, 
            useCORS: true, 
            backgroundColor: null 
        });

        const imageURL = canvas.toDataURL("image/png");
        
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        downloadLink.download = "WaiKru-Card-2026.png"; 
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

    } catch (err) {
        console.error("Save Error: ", err);
        alert("❌ เกิดข้อผิดพลาดในการบันทึกรูปภาพ");
    } finally {
        document.body.removeChild(exportContainer);
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
        randomBtn.disabled = false;
    }
});