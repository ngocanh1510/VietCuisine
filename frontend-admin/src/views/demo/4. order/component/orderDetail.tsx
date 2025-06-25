import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Descriptions, Table, Avatar, Spin, Tag, Typography, Divider } from 'antd';
import moment from 'moment';

const { Title, Text } = Typography;

const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const total= order ? order.totalCost - order.discount : 0;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!order && id) {
        try {
          setLoading(true);
          const res = await axios.get(`http://localhost:3001/order/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setOrder(res.data);
        } catch (err) {
          console.error("Error fetching order:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOrder();
  }, [id, order]);

  if (loading || !order) return <Spin size="large" />;

  const columns = [
    {
      title: 'Tên nguyên liệu',
      dataIndex: ['ingredient', 'name'],
      key: 'name',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPriceAtTime',
      key: 'unitPriceAtTime',
      render: (price: number) => `${price.toLocaleString()}₫`
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_: any, record: any) => `${(record.quantity * record.unitPriceAtTime).toLocaleString()}₫`
    },
  ];
  return (
    <Card bordered style={{ maxWidth: 900, margin: 'auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>HÓA ĐƠN ĐẶT HÀNG</Title>

      <Divider orientation="left">Thông tin khách hàng</Divider>
      <Descriptions bordered column={1} labelStyle={{width: 200 }}>
        <Descriptions.Item label="Họ tên">
          {order.userId?.name || 'Ẩn danh'}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {order.userId?.email}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {order.userId?.phone}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Địa chỉ giao hàng</Divider>
      <Descriptions bordered column={1} labelStyle={{width: 200 }}>
        <Descriptions.Item label="Người nhận">
          {order.shippingAddress?.recipientName}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {order.shippingAddress?.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">
          {order.shippingAddress?.address}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Trạng thái & Thanh toán</Divider>
      <Descriptions bordered column={1} labelStyle={{width: 200 }}>
        <Descriptions.Item label="Trạng thái giao hàng">
          <Tag color={order.deliveryStatus === 'delivered' ? 'green' : 'orange'}>
            {order.deliveryStatus}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái thanh toán">
          <Tag color={order.paymentStatus === 'paid' ? 'green' : 'red'}>
            {order.paymentStatus}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">
          {order.paymentMethod}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">
          {moment(order.orderedAt).format('DD/MM/YYYY HH:mm')}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Chi tiết đơn hàng</Divider>
      <Table
        columns={columns}
        dataSource={order.items}
        rowKey={(item) => item._id || JSON.stringify(item)}
        pagination={false}
        bordered
      />

      <div
        style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 24,
            marginRight: 16,
        }}
        >
        <div
            style={{
            display: 'grid',
            gridTemplateColumns: 'auto auto',
            rowGap: 8,
            columnGap: 4,
            minWidth: 180,
            }}
        >
            {[
            { label: 'Tổng cộng:', value: order.totalCost },
            { label: 'Khuyến mãi:', value: order.discount },
            { label: 'Tổng:', value: total },
            ].map((item) => (
            <>
                <span style={{ fontWeight: 600 }}>{item.label}</span>
                <span style={{ textAlign: 'right' }}>
                {item.value.toLocaleString()}₫
                </span>
            </>
            ))}
        </div>
        </div>

    </Card>
  );
};

export default OrderDetail;
