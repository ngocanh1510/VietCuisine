import User from '../models/User.js';
import Account from '../models/Account.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/email.js';
import { generateOTP } from '../utils/OTP.js';
import dotenv from 'dotenv';

dotenv.config();

// Đăng ký tài khoản mới
export const register = async (req, res) => {
    try {
        const { name, email, password, gender, phone } = req.body;
       
        // Kiểm tra mật khẩu và xác nhận mật khẩu
        // if (password !== cfpassword) {
        //     return res.status(400).json({ message: 'Mật khẩu và xác nhận mật khẩu không khớp!' });
        // }

        // Kiểm tra email hợp lệ

        const phoneRegex = /^\d{10,11}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Email không hợp lệ' });
        }

        // Kiểm tra email hoặc username đã tồn tại
        const existingAccount = await Account.findOne({ username: email });
        const existingUser = await User.findOne({ email });
        if (existingAccount || existingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại!' });
        }

        // Kiểm tra độ mạnh của mật khẩu
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và ký tự đặc biệt.',
            });
        }
        
        // Tạo User
        const user = new User({ name, email, gender, phone, role: 'user' });
        await user.save();


        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo Account
        const account = new Account({
            user: user._id,
            email: email,
            password: hashedPassword,
        });
        await account.save();
        // const savedAccount = await account.save();
        // console.log('Account saved:', savedAccount);

        res.status(201).json({ message: 'Đăng ký tài khoản thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Đăng nhập
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập tên người dùng và mật khẩu' });
        }

        // Tìm tài khoản
        const account = await Account.findOne({ email });
        if (!account) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại.' });
        }
        const user = await User.findById(account.user);

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });
        }

        // Tạo JWT
        const token = jwt.sign({ id: account._id, role: account.role  }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log('req.user:', req.user); 

        res.json({ 
            message: 'Đăng nhập thành công!',
            token,
            account, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
    // res.status(200).json({ message: 'Đăng nhập thành công!' });

};



// Lấy thông tin hồ sơ người dùng
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id; // ID từ JWT

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        }

        const userProfile = {
            name: user.name,
            email: user.email,
            gender: user.gender,
            phone: user.phone,
            avatar: user.avatar,
        };

        res.json(userProfile);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const logout = async (req, res) => {
    try {
        // Xóa token ở phía client, thông qua cookie (nếu sử dụng cookie)
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Nếu đang lưu token trong localStorage/sessionStorage thì thông báo xóa token đó
        res.status(200).json({ message: 'Đã đăng xuất thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi đăng xuất', message: err.message });
    }
};

// Yêu cầu đặt lại mật khẩu
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Tìm tài khoản theo username
        const account = await Account.findOne({ email });
        if (!account) {
            return res.status(404).json({ message: 'Tên đăng nhập không tồn tại.' });
        }
        
        // Tạo OTP ngẫu nhiên
        const otp = generateOTP();

        // Lưu OTP vào cơ sở dữ liệu và thời gian hết hạn
        account.passwordResetToken = otp;
        account.passwordResetExpires = Date.now() + 10 * 60 * 1000; // OTP hết hạn sau 10 phút
        await account.save();
        
        // Gửi OTP qua email
        const mailSubject = 'Đặt lại mật khẩu VietCuisine';
        const mailText = `Mã OTP của bạn là: ${otp}. Mã OTP sẽ hết hạn sau 10 phút.`;

        try {
            await sendEmail(account.email, mailSubject, mailText);
            res.status(200).json({ message: 'Mã OTP đã được gửi tới email của bạn.' });
        } catch (error) {
            res.status(500).json({ message: 'Không thể gửi email', error });
        }
    } catch (error) {
        res.status(500).json({ message: 'Đã có lỗi xảy ra.', error });
    }
};


export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Kiểm tra người dùng
        const account = await Account.findOne({ email: email });
        if (!account) {
            return res.status(404).json({ message: 'Email không tồn tại.' });
        }

        // Kiểm tra OTP
        if (account.passwordResetToken !== otp) {
            return res.status(400).json({ message: 'OTP không chính xác.' });
        }
        
        // Kiểm tra thời gian hết hạn của OTP
        if (Date.now() > account.passwordResetExpires) {
            return res.status(400).json({ message: 'Mã OTP đã hết hạn.' });
        }

        // Đánh dấu OTP đã xác minh
        account.passwordResetToken = null;  // Xóa OTP sau khi đã sử dụng
        account.passwordResetExpires = null;  // Xóa thời gian hết hạn
        account.isOtpVerified = true;
        await account.save();

        console.log('verifyOtp called with:', req.body);
        res.status(200).json({ message: 'OTP hợp lệ. Bạn có thể đặt lại mật khẩu.' });
    } catch (err) {
        console.error('Lỗi chi tiết:', error);
        res.status(500).json({ error: err.message });
    }
};

export const resetPassword = async (req, res) => {
    const {email, newPassword } = req.body;

    try {
        // Kiểm tra người dùng
        const account = await Account.findOne({ email: email });
        if (!account || !account.isOtpVerified) {
            return res.status(400).json({ message: 'OTP chưa được xác minh.' });
        }


        // Kiểm tra độ mạnh của mật khẩu
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và ký tự đặc biệt.',
            });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới
        account.password = hashedPassword;
        account.isOtpVerified = false;
        await account.save();

        res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công.' });

    } catch (error) {
        //console.error('Lỗi chi tiết:', error);
        res.status(500).json({ error: 'Đã có lỗi xảy ra.'})
    }
};


export const updateProfile = async (req, res) => {
    try {
        
        const userId = req.user.id; // ID từ JWT
        const { name, email, gender, phone } = req.body;
        const avatar = req.file?.path; // Lấy avatar từ file nếu có

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ message: 'Email không hợp lệ' });
        }

        const existingUser = await User.findById(userId);

        // Nếu email thay đổi, cập nhật email trong User và username trong Account
        if (email && email !== existingUser.email) {
            // Kiểm tra email đã tồn tại chưa
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }

            // Cập nhật username trong Account
            const account = await Account.findOne({ user: userId });
            account.username = email;
            await account.save();
        }

        // const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;


        // Cập nhật các trường được gửi trong req.body
        const updatedFields = {};
        if (name) updatedFields.name = name;
        if (email) updatedFields.email = email;
        if(avatar) updatedFields.avatar = avatar; // Cập nhật avatar nếu có
        if (email) updatedFields.phone = phone;
        if (email) updatedFields.gender = gender;

        const updatedUser= await User.findByIdAndUpdate(
            userId,
            updatedFields,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Cập nhật thông tin thành công',
            updatedProfile: updatedUser,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};