export const generateOTPEmailHtml = (adminName: string, otp: string, year: number = new Date().getFullYear()) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin OTP Verification</title>
<style>
body{
    margin:0;
    padding:0;
    background:#fdf6f6;
    font-family:Arial, Helvetica, sans-serif;
}
.wrapper{
    width:100%;
    background:#fdf6f6;
    padding:40px 15px;
}
.container{
    max-width:620px;
    margin:auto;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    border:1px solid #E2E8F0;
}
.header{
    background:#fef2f2;
    padding:35px;
}
.logo{
    font-size:34px;
    font-weight:800;
    color:#e50914;
    letter-spacing:.5px;
}
.subtitle{
    color:#555;
    font-size:15px;
    margin-top:8px;
}
.content{
    padding:45px;
}
.title{
    color:#0A0B0D;
    font-size:28px;
    font-weight:700;
    margin-bottom:10px;
}
.text{
    color:#555;
    font-size:16px;
    line-height:28px;
}
.otp-box{
    margin:35px 0;
    background:#fff5f5;
    border:2px dashed #e50914;
    border-radius:16px;
    padding:30px;
    text-align:center;
}
.otp-label{
    color:#777;
    font-size:14px;
    letter-spacing:1px;
    text-transform:uppercase;
}
.otp{
    font-size:46px;
    font-weight:800;
    color:#e50914;
    letter-spacing:10px;
    margin-top:12px;
}
.info-box{
    background:#fff8f8;
    border-left:5px solid #e50914;
    padding:18px 20px;
    border-radius:8px;
    margin-top:20px;
}
.info-box p{
    margin:0;
    color:#555;
    line-height:26px;
    font-size:15px;
}
.warning{
    margin-top:30px;
    color:#777;
    font-size:14px;
    line-height:24px;
}
.footer{
    background:#0A0B0D;
    padding:22px;
    text-align:center;
    color:white;
    font-size:13px;
}
.footer a{
    color:white;
    text-decoration:none;
}
@media only screen and (max-width:600px){
.content{
    padding:30px;
}
.logo{
    font-size:28px;
}
.title{
    font-size:24px;
}
.otp{
    font-size:34px;
    letter-spacing:6px;
}
}
</style>
</head>
<body>
<div class="wrapper">
<div class="container">
<div class="header">
<div class="logo">
ARJUN FILMS
</div>
<div class="subtitle">
Secure Administration Portal
</div>
</div>
<div class="content">
<div class="title">
Admin Verification
</div>
<p class="text">
Hello <strong>${adminName}</strong>,
</p>
<p class="text">
We received a request to sign in to the <strong>Arjun Films Admin Portal</strong>.
Use the verification code below to continue.
</p>
<div class="otp-box">
<div class="otp-label">
One Time Password
</div>
<div class="otp">
${otp}
</div>
</div>
<div class="info-box">
<p>
✔ This OTP is valid for <strong>5 minutes</strong>.<br>
✔ Never share this code with anyone.<br>
✔ Our team will never ask you for your OTP.
</p>
</div>
<p class="warning">
If you didn't request this login, you can safely ignore this email.
No changes will be made to your account.
</p>
</div>
<div class="footer">
<strong>ARJUN FILMS</strong><br><br>
📷 Instagram :
@arjun_photographyyy
<br><br>
📞 +91 7788992712
<br><br>
© ${year} Arjun Films. All rights reserved.
</div>
</div>
</div>
</body>
</html>
`;
