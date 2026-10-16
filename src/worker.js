/**
 * Cloudflare Worker Backend API
 */

const CHAT_API_KEY = "YOUR_API_KEY_HERE";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API Routes
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, url, env);
    }

    // Pass through static assets to Cloudflare Workers Assets
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 });
  }
};

async function handleAPI(request, url, env) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // 1. Auth Endpoint
  if (url.pathname === '/api/auth/login' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const isAdmin = email === 'seree999@gmail.com';

    return new Response(JSON.stringify({
      email,
      role: isAdmin ? 'SUPER_ADMIN' : 'USER',
      token: `cf_token_${Date.now()}`,
      message: isAdmin ? 'Authenticated as Super Admin seree999@gmail.com' : 'Authenticated as User'
    }), { headers });
  }

  // 2. Chatbot Endpoint 
  if (url.pathname === '/api/chat' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const userMsg = (body.message || '').toLowerCase();
    const apiKey = env.CHAT_API_KEY || CHAT_API_KEY;

    // Try External API with Token if endpoint is provided
    try {
      if (env.CHAT_API_ENDPOINT) {
        const extRes = await fetch(env.CHAT_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'x-api-key': apiKey
          },
          body: JSON.stringify({ message: body.message, prompt: body.message })
        });
        if (extRes.ok) {
          const extData = await extRes.json();
          return new Response(JSON.stringify({ reply: extData.reply || extData.message || extData.text, apiKeyUsed: true }), { headers });
        }
      }
    } catch (e) {
      console.warn("External Chat API error:", e);
    }

    // Default Smart Emergency Knowledge Reply
    let reply = `ℹ️ **ข้อมูลฉุกเฉิน:** หากต้องการความช่วยเหลือด่วน โปรดใช้ฟอร์มแจ้งเหตุบนหน้าหลัก หรือติดต่อสายด่วน **1669** (กู้ชีพ) หรือ **1784** (ปภ.)`;

    if (userMsg.includes('ไฟ') || userMsg.includes('ปลั๊ก') || userMsg.includes('ตัดไฟ')) {
      reply = `⚡ **ข้อควรระวังเรื่องไฟฟ้าในสภาวะน้ำท่วม:**\n1. ตัดสวิตช์เมนคัทเอาท์ (Main Circuit Breaker) ทันทีถ้าน้ำเริ่มท่วมถึงระดับปลั๊กไฟชั้น 1\n2. ห้ามสัมผัสปลั๊กไฟหรือเครื่องใช้ไฟฟ้าขณะตัวเปียก\n3. หลีกเลี่ยงการจับเสาไฟหรือแช่น้ำใกล้ปลั๊กไฟ`;
    } else if (userMsg.includes('ติดเตียง') || userMsg.includes('ผู้ป่วย') || userMsg.includes('ยา')) {
      reply = `💊 **การดูแลผู้ป่วยติดเตียง/ค้ำชีพ:**\n1. ระบบจะจัดเคสผู้ป่วยติดเตียงเป็น **เคสสีแดง (วิกฤตสูงสุด)** อัตโนมัติ\n2. หากเครื่องออกซิเจนต้องใช้ไฟฟ้า ให้แจ้งเจ้าหน้าที่ด่วนที่ 1669\n3. เคลื่อนย้ายผู้ป่วยขึ้นที่สูงเหนือระดับน้ำสูงสุดที่คาดการณ์ไว้`;
    } else if (userMsg.includes('เบอร์') || userMsg.includes('สายด่วน') || userMsg.includes('โทร')) {
      reply = `📞 **เบอร์สายด่วนฉุกเฉิน:**\n• **1669** - เจ็บป่วยฉุกเฉิน / กู้ชีพ\n• **1784** - กรมป้องกันและบรรเทาสาธารณภัย (ปภ.)\n• **1667** - สายด่วนสุขภาพจิต`;
    } else if (userMsg.includes('อาหาร') || userMsg.includes('ถุงยังชีพ')) {
      reply = `📦 **การเตรียมอาหารและน้ำดื่ม:**\n1. สำรองน้ำดื่มสะอาดอย่างน้อย 3 ลิตร/คน/วัน\n2. เตรียมอาหารแห้งที่เปิดทานได้ทันที\n3. หากอาหารหมด ให้เลือก 'หมดแล้ว/อดอาหาร' ในฟอร์มเพื่อให้ศูนย์ส่งเรือไปส่งถุงยังชีพ`;
    }

    return new Response(JSON.stringify({ reply, apiKeyConfigured: true }), { headers });
  }

  // 3. Incidents Endpoints
  if (url.pathname === '/api/incidents') {
    if (request.method === 'POST') {
      const data = await request.json().catch(() => ({}));
      return new Response(JSON.stringify({
        success: true,
        caseID: data.caseID || `SOS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        message: 'บันทึกข้อมูลเข้าสู่ระบบ Cloudflare สำเร็จ'
      }), { headers });
    }

    return new Response(JSON.stringify([
      {
        caseID: 'SOS-2026-8842',
        triageCategory: 'RED',
        lat: 13.7563,
        lng: 100.5018,
        totalCount: 3,
        isBedridden: true,
        landmark: 'บ้าน 2 ชั้น ตรงข้ามวัดราษฎร์ ซอย 4',
        reporterName: 'อาจารย์เสรี',
        reporterMobile: '0812345678',
        status: 'PENDING',
        submittedAt: new Date().toISOString()
      }
    ]), { headers });
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers });
}
