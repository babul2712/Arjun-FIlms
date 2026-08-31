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
    background:#f4f2ff;
    font-family:Arial, Helvetica, sans-serif;
}
.wrapper{
    width:100%;
    background:#f4f2ff;
    padding:40px 15px;
}
.container{
    max-width:620px;
    margin:auto;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    border:1px solid #E2DAFF;
}
.header{
    background:#ECE9FF;
    padding:35px;
}
.logo{
    font-size:34px;
    font-weight:800;
    color:#65006C;
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
    color:#65006C;
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
    background:#F5F2FF;
    border:2px dashed #65006C;
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
    color:#65006C;
    letter-spacing:10px;
    margin-top:12px;
}
.info-box{
    background:#FAFAFF;
    border-left:5px solid #65006C;
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
    background:#65006C;
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
ARJUN PHOTOGRAPHY
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
We received a request to sign in to the <strong>Arjun Photography Admin Portal</strong>.
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
<strong>ARJUN PHOTOGRAPHY</strong><br><br>
📷 Instagram :
@arjun_photographyyy
<br><br>
📞 +91 7788992712
<br><br>
© ${year} Arjun Photography. All rights reserved.
</div>
</div>
</div>
</body>
</html>
`;
