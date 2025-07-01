import React, { useEffect, useState } from "react";
import {
  Table, Tag, Button, DatePicker, Space, Modal, message, Avatar, Typography, Divider, List,Tooltip
} from "antd";
import axios from "axios";
import moment from "moment";

import { LikeOutlined, CommentOutlined , DeleteOutlined} from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Title, Paragraph } = Typography;

const ReportManagement: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reportedCommentId, setReportedCommentId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3001/report/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReports(res.data);
      setFilteredReports(res.data);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (dates: any) => {
    if (!dates) {
      setFilteredReports(reports);
      return;
    }
    const [start, end] = dates;
    const filtered = reports.filter((report: any) => {
      const reportDate = moment(report.reportedAt);
      return reportDate.isBetween(start, end, "day", "[]");
    });
    setFilteredReports(filtered);
  };

  const viewDetail = async (record: any) => {
    let postId;
    let commentId = null;

    if (record.targetType === "comments") {
      postId = record.targetId?.targetId;
      commentId = record.targetId?._id;
    } else {
      postId = record.targetId?._id;
    }

    if (!postId) {
      message.error("Không tìm thấy nội dung");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:3001/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const postData = res.data;

      if (record.targetType === "comments") {
        const commentRes = await axios.get(
          `http://localhost:3001/comment?targetId=${postId}&onModel=posts`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        postData.comments = commentRes.data;
        setReportedCommentId(commentId);
      } else {
        setReportedCommentId(null);
      }

      setSelectedPost(postData);
      setIsModalVisible(true);
    } catch (err) {
      message.error("Không thể tải chi tiết bài viết hoặc bình luận");
    }
  };

  const handleDelete = async (model: string, targetId: string) => {
    try {
      await axios.delete(`http://localhost:3001/${model}/${targetId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      message.success("Đã xoá nội dung!");
      fetchReports();
    } catch (error) {
      message.error("Không thể xoá nội dung.");
    }
  };

  const columns = [
    {
      title: "Ngày báo cáo",
      dataIndex: "reportedAt",
      key: "reportedAt",
      render: (text: string) => moment(text).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Người báo cáo",
      dataIndex: ["userId", "name"],
      key: "userId",
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Nền tảng",
      dataIndex: "targetType",
      key: "targetType",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Nội dung bị báo cáo",
      key: "targetId",
      width: 180,
      align: "center" as const,
      render: (_: any, record: any) => {
        if (!record.targetId) return <i> Đã bị xoá</i>;
        return (
          <Button type="link" onClick={() => viewDetail(record)}>
            Xem bài viết
          </Button>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space>
          {record.targetId ? (
            <Tooltip title="Xoá nội dung">
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.targetType, record.targetId._id)}
                />
                </Tooltip>

          ) : (
            <Tag color="gray">Không còn tồn tại</Tag>
          )}
        </Space>
      ),
    },
  ];

  const renderModalContent = () => {
    if (!selectedPost) return null;

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <Avatar src={selectedPost.userId?.avatar} />
          <div style={{ marginLeft: 12 }}>
            <strong>{selectedPost.userId?.name || "Ẩn danh"}</strong>
            <div style={{ fontSize: 12, color: "#999" }}>
              {moment(selectedPost.createdAt).fromNow()}
            </div>
          </div>
        </div>
        <Title level={4}>{selectedPost.caption}</Title>
        {selectedPost.image && (
          <img
            src={selectedPost.image}
            alt="post"
            style={{ width: "100%", borderRadius: 8, marginBottom: 12 }}
          />
        )}
        {selectedPost.recipeId?.title && (
          <Paragraph><strong>Công thức:</strong> {selectedPost.recipeId.title}</Paragraph>
        )}
        <Divider />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div><LikeOutlined /> {selectedPost.likes?.length || 0} lượt thích</div>
          <div><CommentOutlined /> {selectedPost.comments?.length || 0} bình luận</div>
        </div>

        {selectedPost.comments?.length > 0 && (
          <>
            <Title level={5}>Bình luận</Title>
            <List
              dataSource={selectedPost.comments}
              renderItem={(comment: any) => (
                <div
                  style={{
                    backgroundColor: comment._id === reportedCommentId ? "#fffbe6" : "#fafafa",
                    borderLeft: comment._id === reportedCommentId ? "4px solid orange" : undefined,
                    padding: 10,
                    marginBottom: 8,
                    borderRadius: 6,
                  }}
                >
                  <strong>{comment.userId?.name || "Ẩn danh"}</strong>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    <Tooltip title={moment(comment.createdAt).format("YYYY-MM-DD HH:mm:ss")}>
                        <div style={{ fontSize: 12, color: "#999" }}>
                            {moment(comment.createdAt).format("DD/MM/YYYY HH:mm")}
                        </div>
                        </Tooltip>
                  </div>
                  <div style={{ marginTop: 4 }}>{comment.content}</div>
                </div>
              )}
            />
          </>
        )}
      </>
    );
  };

  return (
    <div>
      <h2>Quản lý báo cáo</h2>
      <RangePicker onChange={handleDateFilter} style={{ marginBottom: 16 }} />
      <Table
        columns={columns}
        dataSource={filteredReports}
        rowKey="_id"
        loading={loading}
        bordered
      />

      <Modal
        open={isModalVisible}
        title="Chi tiết bài viết"
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedPost(null);
          setReportedCommentId(null);
        }}
        footer={null}
        width={800}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default ReportManagement;
