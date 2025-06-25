import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Spin } from 'antd';
import { Line, Bar } from '@ant-design/charts';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const [dailyRevenue, setDailyRevenue] = useState<number | null>(null);
  const [newUsers, setNewUsers] = useState<number | null>(null);
  const [dailyOrders, setDailyOrders] = useState<number | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null);
  const [lineData, setLineData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rev, users, orders, monthRev, revByMonth, topIngredients] = await Promise.all([
          axios.get('http://localhost:3001/dashboard/daily-revenue'),
          axios.get('http://localhost:3001/dashboard/new-users'),
          axios.get('http://localhost:3001/dashboard/daily-orders'),
          axios.get('http://localhost:3001/dashboard/monthly-revenue'),
          axios.get('http://localhost:3001/dashboard/revenue-by-month'),
          axios.get('http://localhost:3001/dashboard/top-ingredients')
        ]);

        setDailyRevenue(rev.data);
        setNewUsers(users.data);
        setDailyOrders(orders.data);
        setMonthlyRevenue(monthRev.data);
        setLineData(revByMonth.data.map((item: any) => ({ ...item, month: `Tháng ${item.month}` })));
        setBarData(topIngredients.data.map((item: any) => ({ name: item.name, totalSold: item.quantity })));
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const lineConfig = {
    data: lineData,
    xField: 'month',
    yField: 'value',
    point: { shapeField: 'circle', sizeField: 4 },
    style: { lineWidth: 3 },
  };

  const barConfig = {
    data: barData,
    xField: 'name',
    yField: 'totalSold',
    barWidthRatio: 0.1,
    label: {
      position: 'middle',
      style: { fill: '#FFFFFF', opacity: 0.8 },
    },
  };

  if (loading) return <Spin size="large" />;

  return (
    <div className="p-4" style={{ width: '100%' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card title="Doanh thu hôm nay" style={{ backgroundColor: '#f5222d', color: '#fff' }}>
            <p>{dailyRevenue?.toLocaleString()} VND</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Người dùng mới" style={{ backgroundColor: '#faad14', color: '#fff' }}>
            <p>{newUsers}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Đơn hàng hôm nay" style={{ backgroundColor: '#52c41a', color: '#fff' }}>
            <p>{dailyOrders}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Tổng doanh thu tháng" style={{ backgroundColor: '#1890ff', color: '#fff' }}>
            <p>{monthlyRevenue?.toLocaleString()} VND</p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Doanh thu theo tháng">
            <div style={{ height: 300 }}>
              <Line {...lineConfig} />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top nguyên liệu bán chạy">
            <div style={{ height: 300 }}>
              <Bar {...barConfig} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
