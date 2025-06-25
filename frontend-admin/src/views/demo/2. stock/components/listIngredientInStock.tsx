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
      console.log("Response from API:", response.data); // In ra dữ liệu nhận được từ API
      const transformedData = response.data.ingredients.map((ingredient: any) => ({
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
      console.error("Failed to fetch ingredient:", error);
      message.error("Failed to fetch ingredient. Please try again.");
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
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl: string) => <img src={imageUrl} alt="image" style={{ width: "50px" }} />,
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
