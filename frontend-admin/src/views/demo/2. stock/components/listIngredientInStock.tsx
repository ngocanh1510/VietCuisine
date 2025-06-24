import React, { useEffect, useState } from "react";
import axios from "axios";
import type { TableProps } from "antd";
import { Space, Table, Modal, Input, message } from "antd";

interface DataType {
  key: string;
  brandName: string;
  name: string;
  location: string;
  img: string;
}

const DemoTable: React.FC = () => {
  const [data, setData] = useState<DataType[]>([]); // State để lưu dữ liệu từ API
  const [loading, setLoading] = useState<boolean>(false); // State loading

  // Hàm fetch danh sách rạp chiếu phim từ API
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/ingredient/all");
      const transformedData = response.data.map((ingredient: any) => ({
        key: ingredient._id, // key từ backend (MongoDB ID)
        name:ingredient.name,
        unit: ingredient.unit,
        unitPrice: ingredient.unitPrice,
        stock: ingredient.stock,
        category: ingredient.category,
        imageUrl: ingredient.imageUrl
      }));
      setData(transformedData); // Cập nhật state với dữ liệu đã chuyển đổi
    } catch (error) {
      console.error("Failed to fetch theaters:", error);
      message.error("Failed to fetch theaters. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  // Gọi API khi component mount
  useEffect(() => {
    fetchIngredients();
  }, []);

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
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
    title: "Image",
    dataIndex: "imageUrl",
    key: "imageUrl",
    render: (text) => (
      <a href={text} target="_blank" rel="noopener noreferrer">
        {text.length > 30 ? `${text.slice(0, 30)}...` : text}
      </a>
    ), // Chỉ hiển thị 30 ký tự đầu và cho phép mở URL
  }
];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 5 }}
    />
  );
};

export default DemoTable;
