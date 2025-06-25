import { Button, Card, Form, Input, message } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../api/api";

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        
        try {
            // Gửi request đăng nhập tới API
            const response = await post("http://localhost:3001/auth/login", {
                email: values.username,
                password: values.password,
            });
           
            // Xử lý response thành công
            const { token, user } = response.data;
            // Lưu token và thông tin người dùng vào localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("username", user.name);
            localStorage.setItem("isAuthenticated", "true");
            console.log("token", token)

            message.success("Đăng nhập thành công!");

            // Chuyển hướng đến trang dashboard
            navigate("/admin/dashboard");
        } catch (error: any) {
            // Xử lý lỗi trả về từ server
            if (error.response && error.response.data.message) {
                message.error(error.response.data.message);
            } else {
                message.error("Đã xảy ra lỗi, vui lòng thử lại sau!");
            }
        } finally {
            setLoading(false); // Tắt trạng thái loading
        }
    };
        // setTimeout(() => {
        //     setLoading(false);
        //     // Viết api xác thực ở đây
            
        //     localStorage.setItem("isAuthenticated", "true");
        //     navigate("/admin/dashboard");
        // }, 1000);
    // };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Card title="Đăng Nhập" style={{ width: 400 }}>
                <Form name="login" layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Đăng Nhập
                        </Button>
                        <Button type="link" onClick={() => navigate("/forgot-password")}>
                            Quên mật khẩu?
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;