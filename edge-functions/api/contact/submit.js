/**
 * EdgeOne Pages Edge Function
 * 路由: POST /api/contact/submit
 * 功能: 接收联系表单数据，存入 KV 存储
 * 
 * KV 绑定变量名: contact_kv
 * KV 需在 EdgeOne Pages 控制台创建命名空间并绑定到项目
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    // 验证必填字段
    if (!body.name || !body.email) {
      return new Response(JSON.stringify({
        success: false,
        message: '姓名和邮箱为必填项'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(JSON.stringify({
        success: false,
        message: '邮箱格式不正确'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 检查 KV 是否已绑定
    if (!env.contact_kv) {
      // KV 未绑定时降级为仅记录日志模式（开发环境兼容）
      console.log('KV not bound, logging contact form:', body);
      return new Response(JSON.stringify({
        success: true,
        message: '咨询已提交成功（开发模式）',
        mode: 'dev'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 生成唯一 ID（时间戳 + 随机数）
    const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

    // 构造存储数据
    const record = {
      id,
      name: body.name,
      company: body.company || '',
      email: body.email,
      phone: body.phone || '',
      message: body.message || '',
      createdAt: new Date().toISOString(),
      status: 'pending' // pending / replied / archived
    };

    // 存入 KV（key 格式: messages/2024-04/msg_xxx）
    const dateKey = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const kvKey = `messages/${dateKey}/${id}`;
    await env.contact_kv.put(kvKey, JSON.stringify(record));

    // 更新总计数
    let totalCount = await env.contact_kv.get('total_submissions');
    totalCount = Number(totalCount || 0) + 1;
    await env.contact_kv.put('total_submissions', String(totalCount));

    return new Response(JSON.stringify({
      success: true,
      message: '咨询已提交成功，我们将尽快与您联系',
      id: record.id,
      total: totalCount
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '服务器处理异常，请稍后重试'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理 CORS 预检请求
export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
