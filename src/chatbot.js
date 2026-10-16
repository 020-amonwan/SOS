/**
 * Emergency Q&A Chatbot Module
 */

const KNOWLEDGE_BASE = [
  {
    keywords: ['ไฟฟ้า', 'ไฟดูด', 'ปลั๊ก', 'ตัดไฟ', 'ตู้ไฟ'],
    response: `⚡ **ข้อควรระวังเรื่องไฟฟ้าในสภาวะน้ำท่วม:**\n1. ตัดสวิตช์เมนคัทเอาท์ (Main Circuit Breaker) ทันทีถ้าน้ำเริ่มท่วมถึงระดับปลั๊กไฟชั้น 1\n2. ห้ามสัมผัสปลั๊กไฟ สวิตช์ หรือเครื่องใช้ไฟฟ้าขณะตัวเปียกหรือยืนอยู่ในน้ำ\n3. หากน้ำท่วมมิดชั้น 1 ให้ย้ายขึ้นชั้น 2 และหลีกเลี่ยงการจับเสาไฟหรือแช่น้ำใกล้ปลั๊กไฟ`
  },
  {
    keywords: ['ติดเตียง', 'ผู้ป่วย', 'เครื่องช่วยหายใจ', 'ออกซิเจน', 'ยารักษาโรค'],
    response: `💊 **การดูแลผู้ป่วยติดเตียง/ค้ำชีพ:**\n1. ระบบจะจัดเคสผู้ป่วยติดเตียงเป็น **เคสสีแดง (วิกฤตสูงสุด)** อัตโนมัติ\n2. หากเครื่องออกซิเจนต้องใช้ไฟฟ้า ให้เตรียมแบตเตอรี่สำรอง หรือแจ้งเจ้าหน้าที่ด่วนที่ 1669\n3. เคลื่อนย้ายผู้ป่วยขึ้นที่สูงเหนือระดับน้ำสูงสุดที่คาดการณ์ไว้`
  },
  {
    keywords: ['เบอร์', 'โทร', 'ติดต่อ', 'สายด่วน', 'กู้ภัย', 'ปภ'],
    response: `📞 **เบอร์สายด่วนฉุกเฉิน:**\n• **1669** - เจ็บป่วยฉุกเฉิน / กู้ชีพ\n• **1784** - กรมป้องกันและบรรเทาสาธารณภัย (ปภ.)\n• **1667** - สายด่วนสุขภาพจิต\n• **1554** - หน่วยกู้ชีพ วชิรพยาบาล`
  },
  {
    keywords: ['อาหาร', 'น้ำดื่ม', 'ถุงยังชีพ', 'หิว'],
    response: `📦 **การเตรียมอาหารและน้ำดื่ม:**\n1. สำรองน้ำดื่มสะอาดอย่างน้อย 3 ลิตร/คน/วัน\n2. เตรียมอาหารแห้ง อาหารกระป๋องที่เปิดทานได้ทันทีโดยไม่ต้องต้ม\n3. หากอาหารหมด ให้แจ้งในฟอร์มเลือก 'หมดแล้ว/อดอาหาร' เพื่อให้ศูนย์สั่งการส่งเรือนำส่งถุงยังชีพ`
  },
  {
    keywords: ['สัตว์เลี้ยง', 'หมา', 'แมว'],
    response: `🐾 **การช่วยเหลือสัตว์เลี้ยง:**\n1. ปลดสายจูงหรือออกจากกรงเพื่อไม่ให้สัตว์จมน้ำหากระดับน้ำเพิ่มขึ้นเร็ว\n2. นำสัตว์เลี้ยงใส่ตะกร้าหรือกระเป๋าอพยพขึ้นชั้นสูงพร้อมอาหารสัตว์`
  },
  {
    keywords: ['แจ้งเหตุ', 'ขอความช่วยเหลือ', 'วิธีแจ้ง', 'sos'],
    response: `🚨 **วิธีแจ้งขอความช่วยเหลือ:**\n1. กดปุ่ม 'ดึงพิกัด GPS ปัจจุบัน'\n2. กรอกบ้านเลขที่/จุดสังเกต\n3. เลือกจำนวนคนและกลุ่มเปราะบาง\n4. เลือกระดับน้ำ แล้วกด 'ส่งขอความช่วยเหลือด่วน (SOS)'`
  }
];

export function initChatbot() {
  const container = document.createElement('div');
  container.id = 'chatbot-widget';
  container.innerHTML = `
    <!-- Floating Chat Trigger Button -->
    <button id="chatbot-toggle-btn" class="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-blue-400/30 transition-all transform hover:scale-105 active:scale-95">
      <span class="text-2xl animate-pulse">💬</span>
      <span class="text-xs font-bold pr-1">ผู้ช่วย AI ฉุกเฉิน</span>
    </button>

    <!-- Chat Modal Window -->
    <div id="chatbot-modal" class="fixed bottom-20 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden hidden flex-col max-h-[500px]">
      <!-- Header -->
      <div class="bg-slate-950 p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">AI</div>
          <div>
            <div class="text-xs font-bold text-white">ผู้ช่วยฉุกเฉินน้ำท่วม (Flood AI)</div>
            <div class="text-[10px] text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> พร้อมตอบคำถาม 24 ชม.
            </div>
          </div>
        </div>
        <button id="chatbot-close-btn" class="text-slate-400 hover:text-white p-1 text-lg">✕</button>
      </div>

      <!-- Quick Chips -->
      <div class="p-2 bg-slate-950/50 border-b border-slate-800/80 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <button class="chat-chip bg-slate-800 hover:bg-slate-700 text-blue-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-700">⚡ ตัดไฟอย่างไร?</button>
        <button class="chat-chip bg-slate-800 hover:bg-slate-700 text-red-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-700">💊 ผู้ป่วยติดเตียง</button>
        <button class="chat-chip bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-700">📞 เบอร์สายด่วน</button>
        <button class="chat-chip bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-700">📦 ถุงยังชีพ</button>
      </div>

      <!-- Messages Body -->
      <div id="chatbot-messages" class="p-3 overflow-y-auto space-y-3 flex-1 text-xs text-slate-200 min-h-[250px]">
        <div class="bg-slate-800/90 border border-slate-700 rounded-xl p-2.5 max-w-[85%] space-y-1">
          <div class="font-bold text-blue-400 text-[11px]">🤖 ผู้ช่วยฉุกเฉิน</div>
          <div>สวัสดีครับ มีข้อสงสัยเกี่ยวกับการรับมือภัยน้ำท่วม การตัดไฟ การดูแลผู้ป่วย หรือการแจ้งขอความช่วยเหลือ สามารถสอบถามได้เลยครับ</div>
        </div>
      </div>

      <!-- Input Form -->
      <form id="chatbot-form" class="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2" onsubmit="return false;">
        <input type="text" id="chatbot-input" placeholder="พิมพ์คำถามที่นี่..." class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500">
        <button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold">ส่ง</button>
      </form>
    </div>
  `;

  document.body.appendChild(container);

  // Event Listeners
  const toggleBtn = document.getElementById('chatbot-toggle-btn');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const modal = document.getElementById('chatbot-modal');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const messagesDiv = document.getElementById('chatbot-messages');

  toggleBtn?.addEventListener('click', () => {
    modal?.classList.toggle('hidden');
    modal?.classList.toggle('flex');
    if (!modal?.classList.contains('hidden')) {
      input?.focus();
    }
  });

  closeBtn?.addEventListener('click', () => {
    modal?.classList.add('hidden');
    modal?.classList.remove('flex');
  });

  document.querySelectorAll('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.textContent.replace(/^[^a-zA-Z0-9ก-๙]+/, '').trim();
      handleUserMessage(text);
    });
  });

  form?.addEventListener('submit', () => {
    const text = input?.value.trim();
    if (text) {
      handleUserMessage(text);
      if (input) input.value = '';
    }
  });

  async function handleUserMessage(userText) {
    appendMessage('user', userText);

    // Call Cloudflare API / Local fallback
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      if (res.ok) {
        const data = await res.json();
        appendMessage('bot', data.reply);
        return;
      }
    } catch (e) {
      // Offline / Fallback local search
    }

    // Local Knowledge Search
    const lower = userText.toLowerCase();
    let matched = null;
    for (const kb of KNOWLEDGE_BASE) {
      if (kb.keywords.some(kw => lower.includes(kw))) {
        matched = kb.response;
        break;
      }
    }

    if (!matched) {
      matched = `ℹ️ **คำแนะนำการขอความช่วยเหลือ:**\nหากท่านต้องการแจ้งเหตุฉุกเฉินทันที โปรดใช้ฟอร์มแจ้งเหตุบนหน้าหลัก โดยระบุพิกัด GPS และจำนวนผู้ติดค้าง หรือโทร **1669** (กู้ชีพ) หรือ **1784** (ปภ.)`;
    }

    setTimeout(() => {
      appendMessage('bot', matched);
    }, 400);
  }

  function appendMessage(sender, text) {
    if (!messagesDiv) return;
    const msgEl = document.createElement('div');
    if (sender === 'user') {
      msgEl.className = 'bg-blue-600 text-white rounded-xl p-2.5 max-w-[85%] ml-auto text-right';
      msgEl.textContent = text;
    } else {
      msgEl.className = 'bg-slate-800/90 border border-slate-700 rounded-xl p-2.5 max-w-[85%] space-y-1';
      msgEl.innerHTML = `<div class="font-bold text-blue-400 text-[11px]">🤖 ผู้ช่วยฉุกเฉิน</div><div>${text.replace(/\n/g, '<br>')}</div>`;
    }
    messagesDiv.appendChild(msgEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}
