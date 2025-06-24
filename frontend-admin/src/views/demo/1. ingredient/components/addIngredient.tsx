import { Button, Form, Input, Upload, InputNumber, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const { Option } = Select;

const IngredientForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [token, setToken] = useState("");
  
    useEffect(() => {
      const storedToken = localStorage.getItem("token");
      console.log(storedToken);
      if (storedToken) {
        setToken(storedToken);
      }
    }, []);

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("unit", values.unit);
      formData.append("unitPrice", values.unitPrice);
      formData.append("stock", values.stock);
      formData.append("category", values.category);
      if (fileList.length > 0) {
        formData.append("image", fileList[0].originFileObj);
      }

      console.log(formData)
      const res = await axios.post("http://localhost:3001/ingredient/add", formData, {
        headers: { "Content-Type": "multipart/form-data" ,
        Authorization: `Bearer ${token}`
        },
      });

      alert("Nguyên liệu đã được thêm thành công!");
      console.log(res.data);
      form.resetFields();
      setFileList([]);
    } catch (err: any) {
      console.error("Lỗi khi thêm nguyên liệu:", err.response?.data || err.message);
    }
  };

  const handleUpload = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      console.log("Excel data:", json);

      // Gửi bulk qua API nếu muốn
      axios.post("http://localhost:3001/ingredient/bulk-upload", json)
        .then(() => alert("Tải danh sách nguyên liệu thành công!"))
        .catch((err) => console.error("Lỗi:", err));
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  return (
    <Form layout="vertical" onFinish={onFinish} form={form}>
      <Form.Item name="name" label="Tên nguyên liệu" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="unit" label="Đơn vị" rules={[{ required: true }]}>
       <Select mode="tags" style={{ width: '100%' }} placeholder="Nhập hoặc chọn đơn vị">
          <Option value="100g">100g</Option>
          <Option value="1kg">1kg</Option>
          <Option value="1 cái">1 cái</Option>
          <Option value="1 lít">1 lít</Option>
          <Option value="1 bó">1 bó</Option>
          <Option value="1 quả">1 quả</Option>
        </Select>
      </Form.Item>

      <Form.Item name="unitPrice" label="Giá mỗi đơn vị" rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="stock" label="Số lượng trong kho" rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="category" label="Loại nguyên liệu" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="image" label="Ảnh nguyên liệu">
        <Upload
          beforeUpload={() => false}
          onChange={({ fileList }) => setFileList(fileList)}
          fileList={fileList}
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
      </Form.Item>

      <Form.Item label="Tải danh sách từ Excel (.xlsx)">
        <Upload beforeUpload={handleUpload} accept=".xlsx,.xls">
          <Button icon={<UploadOutlined />}>Upload Excel</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">Thêm nguyên liệu</Button>
      </Form.Item>

    </Form>
  );
};

export default IngredientForm;
