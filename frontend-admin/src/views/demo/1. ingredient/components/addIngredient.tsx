import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Modal,
  Table,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import axios from "axios";

const { Option } = Select;

const IngredientForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [token, setToken] = useState("");
  const [excelModalVisible, setExcelModalVisible] = useState(false);
  const [parsedIngredients, setParsedIngredients] = useState<any[]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  // Submit form nhập tay
  const onFinish = async (values: any) => {
    try {
      const payload = [{
        ...values,
        imageUrl: fileList[0]?.originFileObj?.name || "",
      }];

      await axios.post("http://localhost:3001/ingredient/add", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      message.success("Thêm nguyên liệu thành công!");
      form.resetFields();
      setFileList([]);
    } catch (err: any) {
      console.error("Lỗi:", err.response?.data || err.message);
      message.error("Thêm nguyên liệu thất bại.");
    }
  };

  // Parse Excel và lưu vào state
  const handleExcelUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setParsedIngredients(json);
      message.success("Đã đọc file Excel! Kiểm tra bảng bên dưới.");
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  // Gửi mảng parsed từ Excel lên BE
  const handleExcelSubmit = async () => {
    try {
      await axios.post("http://localhost:3001/ingredient/add", parsedIngredients, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Thêm nguyên liệu thành công!");
      setParsedIngredients([]);
      setExcelModalVisible(false);
    } catch (err: any) {
      console.error("Lỗi Excel:", err.response?.data || err.message);
      message.error("Không thể thêm nguyên liệu từ Excel");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Nút mở modal Excel */}
      <Button
        type="primary"
        icon={<UploadOutlined />}
        style={{ position: "absolute", right: 0, top: 0, zIndex: 1 }}
        onClick={() => setExcelModalVisible(true)}
      >
        Thêm từ Excel
      </Button>

      <h2>Nhập nguyên liệu</h2>
      <Form layout="vertical" form={form} onFinish={onFinish} >
        <Form.Item name="name" label="Tên nguyên liệu" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="unit" label="Đơn vị" rules={[{ required: true }]}>
          <Select mode="tags" placeholder="Nhập hoặc chọn đơn vị">
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

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Thêm nguyên liệu
          </Button>
        </Form.Item>
      </Form>

      {/* Modal Excel */}
      <Modal
        open={excelModalVisible}
        title="Thêm nguyên liệu từ Excel"
        onCancel={() => setExcelModalVisible(false)}
        onOk={handleExcelSubmit}
        okText="Thêm nguyên liệu"
        width={800}
      >
        <Upload
          beforeUpload={handleExcelUpload}
          accept=".xlsx,.xls"
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
        </Upload>

        {parsedIngredients.length > 0 && (
          <Table
            dataSource={parsedIngredients}
            columns={[
              { title: "Tên nguyên liệu", dataIndex: "name", key: "name" },
              { title: "Đơn vị", dataIndex: "unit", key: "unit" },
              { title: "Giá mỗi đơn vị", dataIndex: "unitPrice", key: "unitPrice" },
              { title: "Tồn kho", dataIndex: "stock", key: "stock" },
              { title: "Loại", dataIndex: "category", key: "category" },
              { title: "Ảnh", dataIndex: "image", key: "image" },
            ]}
            rowKey={(record, index) => String(index)}
            pagination={false}
            style={{ marginTop: 16 }}
            bordered
          />
        )}
      </Modal>
    </div>
  );
};

export default IngredientForm;
