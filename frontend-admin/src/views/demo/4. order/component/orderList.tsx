import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, message, Button } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3001/admin/order/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      console.log("Response from API:", res.data);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
    },
    {
      title: 'Người đặt',
      key: 'userName',
      render: (record: any) => record.userId?.name || 'Ẩn danh',
    },
    {
      title: 'SĐT đặt',
      key: 'userPhone',
      render: (record: any) => record.userId?.phone || 'Không rõ',
    },
    {
      title: 'Địa chỉ giao hàng',
      key: 'address',
      render: (record: any) => record.shippingAddress?.address || '',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderedAt',
      key: 'orderedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (totalCost: number) => `${totalCost?.toLocaleString()}₫`,
    },
    {
      title: 'Thanh toán',
      key: 'payment',
      render: (record: any) => (
        <>
          <Tag color="purple">{record.paymentMethod}</Tag>
          <Tag color={record.paymentStatus === 'paid' ? 'green' : 'red'}>
            {record.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </Tag>
        </>
      )
    },
    {
      title: 'Trạng thái giao hàng',
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
      render: (status: string) => {
        let color = status === 'delivered'
          ? 'green'
          : status === 'processing'
          ? 'orange'
          : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Mặt hàng',
      key: 'items',
      render: (record: any) => (
        <ul style={{ paddingLeft: 16 }}>
          {record.items.map((item: any, idx: number) => (
            <li key={idx}>
              {item.ingredient?.name} × {item.quantity} 
            </li>
          ))}
        </ul>
      )
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button onClick={() => navigate(`/admin/order/${record._id}`)}>Xem</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Danh sách đơn hàng</h1>
      <Table
        rowKey="_id"
        dataSource={orders}
        columns={columns}
        loading={loading}
        bordered
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default OrderList;
