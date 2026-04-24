/**
 * EdgeOne Pages Edge Function
 * 路由: GET /api/stats/visit
 * 功能: 页面访问统计 + 获取统计数据
 * 
 * KV 绑定变量名: contact_kv（复用同一个 KV 命名空间）
 */

export async function onRequestGet(context) {
  const { env } = context;

  // KV 未绑定时返回默认值（开发环境兼容）
  if (!env.contact_kv) {
    return new Response(JSON.stringify({
      visits: 0,
      submissions: 0,
      online: Math.floor(Math.random() * 20) + 5, // 模拟在线人数
      mode: 'dev'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    // 递增访问计数
    let visitCount = await env.contact_kv.get('visit_count');
    visitCount = Number(visitCount || 0) + 1;
    await env.contact_kv.put('visit_count', String(visitCount));

    // 获取提交总数
    const submissions = await env.contact_kv.get('total_submissions');
    const submissionCount = Number(submissions || 0);

    // 模拟在线人数（基于近期访问量的简单估算）
    const online = Math.min(Math.floor(visitCount / 50) + 3, 99);

    return new Response(JSON.stringify({
      visits: visitCount,
      submissions: submissionCount,
      online,
      mode: 'production'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      visits: 0,
      submissions: 0,
      online: 0,
      error: 'stats unavailable'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
