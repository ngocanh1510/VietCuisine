import { Space, Table, Modal, Form, Input, Button, message, Select, Upload } from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { UploadOutlined } from "@ant-design/icons";
import {
  DeleteOutlined, EyeOutlined,EditOutlined
} from "@ant-design/icons";
const { Option } = Select;

const { confirm } = Modal;

interface DataType {
  key: string;
  name: string;
  unit: string;
  unitPrice: number;
  stock: number;
  category: string;
  imageUrl: string;
}

const DemoTable: React.FC = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<DataType | null>(null);
  const [token, setToken] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);
    
      useEffect(() => {
        const storedToken = localStorage.getItem("token");
        console.log(storedToken);
        if (storedToken) {
          setToken(storedToken);
        }
      }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/ingredient/all');
      const ingredients = response.data.ingredients || response.data;

      if (!Array.isArray(ingredients)) {
        throw new Error("API response is not an array");
      }

      const transformedData = ingredients.map((ingredient: any) => ({
        key: ingredient._id,
        name: ingredient.name,
        unit: ingredient.unit,
        unitPrice: ingredient.unitPrice,
        stock: ingredient.stock,
        category: ingredient.category,
        imageUrl: ingredient.imageUrl
      }));

      setData(transformedData);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      console.log("id",id)
      await axios.delete(`http://localhost:3001/ingredient/${id}`,
        {
        headers: { 
        Authorization: `Bearer ${token}`
        },
      });
      setData(data.filter((ingredient) => ingredient.key !== id));
      message.success("Xóa nguyên liệu thành công!");
    } catch (error) {
      console.error("Failed to delete ingredient:", error);
      message.error("Failed to delete ingredient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (id: string, title: string) => {
    confirm({
      title: `Bạn có chắc chắn muốn xóa nguyên liệu "${name}"?`,
      content: "Hành động này không thể phục hồi",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        handleDelete(id);
      },
      onCancel() {
        console.log("Cancelled delete");
      },
    });
  };

  const showEditModal = (ingredient: DataType) => {
    setEditingIngredient(ingredient);
    setIsModalVisible(true);
  };

  const handleEdit =async (values: DataType) => {
    console.log("Editing ingredient:", values);
      if (!editingIngredient) return;
    
      try {
        setLoading(true);
        const response = await axios.put(`http://localhost:3001/ingredient/${editingIngredient.key}`, values,
        {
          headers: { 
          Authorization: `Bearer ${token}`
          },
        });
        message.success("Nguyên liệu đã được cập nhật thành công!");
    
        const updatedData = data.map((ingredient) =>
          ingredient.key === editingIngredient.key ? { ...ingredient, ...values } : ingredient
        );
        setData(updatedData);
      } catch (error) {
        console.error("Failed to update ingredient:", error);
        message.error("Cập nhật nguyên liệu thất bại, vui lòng thử lại.");
      } finally {
        setLoading(false);
        setIsModalVisible(false);
        setEditingIngredient(null);
      }
    
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Price Per Unit",
      dataIndex: "unitPrice",
      key: "unitPrice",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 100,
    },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      align: "center" as const,
      render: (imageUrl: string) => <img src={imageUrl} alt="poster" style={{ width: "60px" }} />,
    },
    {
      title: "Action",
      key: "action",
      align: "center" as const,
      width: 150,
      render: (_: any, record: DataType) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.key, record.name)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table 
        columns={columns} 
        dataSource={data} 
        loading={loading} 
        bordered/>

      <Modal
        title="Edit Ingredient"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        {editingIngredient && (
          <Form initialValues={editingIngredient} onFinish={handleEdit}>
            <Form.Item name="name" label="Name">
              <Input />
            </Form.Item>
            <Form.Item name="unit" label="Unit">
            <Select mode="tags" style={{ width: '100%' }} placeholder="Nhập hoặc chọn đơn vị">
                <Option value="100g">100g</Option>
                <Option value="1kg">1kg</Option>
                <Option value="1 cái">1 cái</Option>
                <Option value="1 lít">1 lít</Option>
                <Option value="1 bó">1 bó</Option>
                <Option value="1 quả">1 quả</Option>
            </Select>
            </Form.Item>
            <Form.Item name="unitPrice" label="Price Per Unit">
              <Input />
            </Form.Item>
            <Form.Item name="stock" label="Stock">
              <Input />
            </Form.Item>
            <Form.Item name="category" label="Category">
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
                Save
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default DemoTable;
