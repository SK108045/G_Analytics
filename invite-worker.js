const PORTAL_ORIGIN='https://g-analytics.johnwakaba146.workers.dev';
const FROM='Rieng254 Analytics <analytics@nicoofurniture.co.ke>';
const PROPERTY='rieng254.com';
const enc=new TextEncoder();

const EMAIL_TEMPLATE="<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"color-scheme\" content=\"light\"><meta name=\"supported-color-schemes\" content=\"light\"><title>Analytics access notification</title></head><body style=\"margin:0;padding:0;background:#f8f9fa;font-family:Arial,Helvetica,sans-serif;color:#202124\"><div style=\"display:none;max-height:0;overflow:hidden;opacity:0;color:transparent\">You have been granted access to analytics for {{PROPERTY_NAME}}.</div><table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"width:100%;background:#f8f9fa\"><tr><td align=\"center\" style=\"padding:36px 16px\"><table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"width:100%;max-width:600px\"><tr><td style=\"padding:0 2px 20px 2px\"><table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tr><td valign=\"middle\" style=\"padding-right:12px\"><table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" aria-label=\"Analytics\"><tr><td valign=\"bottom\" style=\"padding-right:3px\"><div style=\"width:6px;height:13px;background:#e37400;border-radius:3px\"></div></td><td valign=\"bottom\" style=\"padding-right:3px\"><div style=\"width:6px;height:21px;background:#f9ab00;border-radius:3px\"></div></td><td valign=\"bottom\"><div style=\"width:6px;height:29px;background:#fbbc04;border-radius:3px\"></div></td></tr></table></td><td valign=\"middle\"><div style=\"font-size:20px;line-height:24px;font-weight:500;color:#3c4043\">Rieng254 Analytics</div><div style=\"font-size:12px;line-height:18px;color:#80868b\">Reporting portal</div></td></tr></table></td></tr><tr><td style=\"background:#ffffff;border:1px solid #dadce0;border-radius:12px;overflow:hidden\"><table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tr><td style=\"padding:36px 40px 12px 40px\"><div style=\"font-size:12px;line-height:18px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#1a73e8;margin-bottom:12px\">Analytics access</div><h1 style=\"margin:0;font-size:28px;line-height:36px;font-weight:500;color:#202124\">Hello,</h1><p style=\"margin:18px 0 0;font-size:15px;line-height:24px;color:#5f6368\">We want to alert you that you have been granted <strong style=\"color:#202124\">{{ROLE}}</strong> access to the analytics account for <strong style=\"color:#202124\">{{PROPERTY_NAME}}</strong>.</p><p style=\"margin:12px 0 0;font-size:15px;line-height:24px;color:#5f6368\">Please use the button below to access this account.</p></td></tr><tr><td style=\"padding:14px 40px 8px 40px\"><table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background:#f8fafd;border:1px solid #e4e7eb;border-radius:8px\"><tr><td style=\"padding:18px 20px\"><table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tr><td style=\"font-size:12px;line-height:18px;color:#80868b;padding-bottom:3px\">Property</td><td align=\"right\" style=\"font-size:12px;line-height:18px;color:#80868b;padding-bottom:3px\">Access level</td></tr><tr><td style=\"font-size:15px;line-height:22px;font-weight:600;color:#202124\">{{PROPERTY_NAME}}</td><td align=\"right\" style=\"font-size:15px;line-height:22px;font-weight:600;color:#202124\">{{ROLE}}</td></tr></table></td></tr></table></td></tr><tr><td style=\"padding:22px 40px 14px 40px\"><table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tr><td bgcolor=\"#1a73e8\" style=\"border-radius:5px\"><a href=\"{{ACCESS_URL}}\" style=\"display:inline-block;padding:12px 22px;font-size:14px;line-height:20px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:5px\">View analytics</a></td></tr></table></td></tr><tr><td style=\"padding:8px 40px 30px 40px\"><p style=\"margin:0;font-size:15px;line-height:24px;color:#5f6368\">Sincerely,<br><strong style=\"color:#3c4043;font-weight:500\">The Rieng254 Analytics Team</strong></p></td></tr><tr><td style=\"border-top:1px solid #eceff1;padding:20px 40px 24px 40px\"><p style=\"margin:0;font-size:12px;line-height:19px;color:#80868b\">This message was sent from a notification-only email address that does not accept incoming email. Please do not reply to this message.</p><p style=\"margin:7px 0 0;font-size:11px;line-height:18px;color:#9aa0a6\">Sent from <strong style=\"color:#80868b\">analytics@nicoofurniture.co.ke</strong>. This is an independent analytics reporting portal.</p></td></tr></table></td></tr><tr><td align=\"center\" style=\"padding:18px 24px 0 24px;font-size:11px;line-height:18px;color:#9aa0a6\">© Rieng254 Analytics · Secure report access</td></tr></table></td></tr></table></body></html>";

function cors(){return {'access-control-allow-origin':PORTAL_ORIGIN,'access-control-allow-headers':'content-type,authorization','access-control-allow-methods':'POST,OPTIONS','content-type':'application/json;charset=utf-8'}}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:cors()})}
function b64u(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function b64Text(s){return b64u(enc.encode(s))}
async function sign(input,secret){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64u(new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(input))))}
async function tokenFor(email,role,secret){const payload=b64Text(JSON.stringify({email,role,iat:Date.now(),exp:Date.now()+24*60*60*1000}));return payload+'.'+await sign(payload,secret)}
async function verifyToken(token,email,secret){const parts=String(token||'').split('.');if(parts.length!==2)return null;const sig=await sign(parts[0],secret);if(sig!==parts[1])return null;let p;try{const raw=atob(parts[0].replace(/-/g,'+').replace(/_/g,'/'));p=JSON.parse(new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0))))}catch{return null}if(!p||p.exp<Date.now()||String(p.email).toLowerCase()!==String(email).toLowerCase())return null;return p}

function emailHtml(email,role,url){
  return EMAIL_TEMPLATE
    .replaceAll('{{ROLE}}',role)
    .replaceAll('{{PROPERTY_NAME}}',PROPERTY)
    .replaceAll('{{RECIPIENT_EMAIL}}',email)
    .replaceAll('{{ACCESS_URL}}',url);
}

function emailText(email,role,url){
  return 'Hello,\n\nWe want to alert you that you have been granted '+role+' access to the analytics account for '+PROPERTY+'.\nPlease use the following link to access this account:\n'+url+'\n\nSincerely,\nThe Rieng254 Analytics Team\n\nThis message was sent from a notification-only email address that does not accept incoming email. Please do not reply to this message.';
}

export default{
  async fetch(request,env){
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors()});
    const u=new URL(request.url);

    if(u.pathname==='/health')return json({ok:true,resendConfigured:!!env.RESEND_API_KEY,signingConfigured:!!env.INVITE_SIGNING_SECRET,adminConfigured:!!env.ADMIN_INVITE_KEY});

    if(u.pathname==='/verify'&&request.method==='POST'){
      if(!env.INVITE_SIGNING_SECRET)return json({ok:false,error:'Invite verification is not configured yet.'},503);
      const {email,token}=await request.json().catch(()=>({}));
      const p=await verifyToken(token,email,env.INVITE_SIGNING_SECRET);
      return p?json({ok:true,email:p.email,role:p.role}):json({ok:false,error:'Invalid or expired invitation.'},401);
    }

    if(u.pathname==='/invite'&&request.method==='POST'){
      if(!env.INVITE_SIGNING_SECRET||!env.ADMIN_INVITE_KEY)return json({error:'Invite service is not fully configured yet.'},503);
      const auth=request.headers.get('authorization')||'';
      if(auth!=='Bearer '+env.ADMIN_INVITE_KEY)return json({error:'Unauthorized'},401);

      const body=await request.json().catch(()=>({}));
      const email=String(body.email||'').trim().toLowerCase();
      const role=['Viewer','Analyst'].includes(body.role)?body.role:'Viewer';
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return json({error:'Invalid email address'},400);

      const token=await tokenFor(email,role,env.INVITE_SIGNING_SECRET);
      const accessUrl=PORTAL_ORIGIN+'/access.html?email='+encodeURIComponent(email)+'&token='+encodeURIComponent(token);

      if(body.send===false)return json({ok:true,sent:false,accessUrl});
      if(!env.RESEND_API_KEY)return json({error:'Resend is not configured yet. Add RESEND_API_KEY as a Worker secret after the domain is verified.',accessUrl},503);

      const rr=await fetch('https://api.resend.com/emails',{
        method:'POST',
        headers:{'authorization':'Bearer '+env.RESEND_API_KEY,'content-type':'application/json'},
        body:JSON.stringify({
          from:FROM,
          to:[email],
          subject:'You’re invited to view analytics for '+PROPERTY,
          html:emailHtml(email,role,accessUrl),
          text:emailText(email,role,accessUrl)
        })
      });

      const data=await rr.json().catch(()=>({}));
      if(!rr.ok)return json({error:data.message||'Resend rejected the email',details:data,accessUrl},502);
      return json({ok:true,sent:true,id:data.id,accessUrl});
    }

    return json({error:'Not found'},404);
  }
};