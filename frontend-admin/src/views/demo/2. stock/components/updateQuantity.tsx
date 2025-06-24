import React, { useState } from 'react';
import { Table, InputNumber, AutoComplete, Button, Popconfirm, message, Upload } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

const InventoryTable = () => {
  const [dataSource, setDataSource] = useState([
    getEmptyRow()
  ]);
  const [searchOptions, setSearchOptions] = useState([]);

  function getEmptyRow() {
    return {
      key: Date.now(),
      ingredientId: '',
      name: '',
      stock: 0,
      unit: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
    };
  }

  const handleSearch = async (value: string, index: number) => {
    if (!value) return;
    try {
      const res = await axios.get(`http://localhost:3001/ingredient/search?keyword=${value}`);
      const options = res.data.ingredients.map((item: any) => ({
        value: item.name,
        label: `${item.name} (${item.unit}) - ${item.stock} trong kho`,
        data: item,
      }));
      setSearchOptions(options);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleSelect = (value: string, option: any, index: number) => {
    const selected = option.data;
    const updated = [...dataSource];
    updated[index] = {
      ...updated[index],
      name: selected.name,
      ingredientId: selected._id,
      stock: selected.stock,
      unit: selected.unit,
      unitPrice: selected.unitPrice || 0,
      totalPrice: (updated[index].quantity || 0) * (selected.unitPrice || 0),
    };
    setDataSource(updated);
  };

  type IngredientRow = {
  key: number;
  ingredientId: string;
  name: string;
  stock: number;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type NumberKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

type NumberField = NumberKeys<IngredientRow>; 

const handleChange = (value: number, index: number, field: NumberField) => {
  const updated = [...dataSource];
  updated[index][field] = value; // 
  if (field === 'quantity' || field === 'unitPrice') {
    updated[index].totalPrice = (updated[index].quantity || 0) * (updated[index].unitPrice || 0);
  }
  setDataSource(updated);
};



  const addRow = () => {
    setDataSource([...dataSource, getEmptyRow()]);
  };

  const deleteRow = (key: number) => {
    const filtered = dataSource.filter((item) => item.key !== key);
    setDataSource(filtered.length > 0 ? filtered : [getEmptyRow()]);
  };

  const handleSubmit = async () => {
    const payload = dataSource
      .filter(item => item.ingredientId && item.quantity > 0)
      .map(({ ingredientId, quantity, unitPrice }) => ({
        ingredientId,
        quantity,
        unitPrice
      }));

    if (payload.length === 0) {
      return message.warning("Vui lòng nhập nguyên liệu hợp lệ.");
    }

    try {
      const res = await axios.post("http://localhost:3001/ingredient/updateStockUnified", payload);
      message.success("Nhập kho thành công!");
    } catch (err) {
      console.error("Lỗi khi nhập kho:", err);
      message.error("Lỗi khi nhập kho.");
    }
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      const converted = json.map((item, idx) => ({
        key: Date.now() + idx,
        ingredientId: '', // bạn có thể map thêm ID nếu cần
        name: item.name || '',
        stock: item.stock || 0,
        unit: item.unit || '',
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        totalPrice: Number(item.quantity || 0) * Number(item.unitPrice || 0),
      }));

      setDataSource(converted);
    };
    reader.readAsArrayBuffer(file);
    return false; // không upload lên server
  };

  const columns = [
    {
      title: 'Mã nguyên liệu',
      dataIndex: 'ingredientId',
      render: (_: any, record: any) => <span>{record.ingredientId}</span>,
    },
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'name',
      render: (_: any, record: any, index: number) => (
        <AutoComplete
          value={record.name}
          options={searchOptions}
          style={{ width: 200 }}
          onSearch={(value) => handleSearch(value, index)}
          onSelect={(value, option) => handleSelect(value, option, index)}
          onChange={(value) => {
            const updated = [...dataSource];
            updated[index].name = value;
            setDataSource(updated);
          }}
          placeholder="Nhập tên nguyên liệu"
        />
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
    },
    {
      title: 'Số lượng nhập',
      dataIndex: 'quantity',
      render: (_: any, record: any, index: number) => (
        <InputNumber
          min={0}
          value={record.quantity}
          onChange={(value) => handleChange(value || 0, index, 'quantity')}
        />
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice'
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalPrice',
      render: (value: number) => <span>{value.toLocaleString()}₫</span>,
    },
    {
      title: '',
      dataIndex: 'actions',
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Popconfirm title="Xóa dòng này?" onConfirm={() => deleteRow(record.key)}>
          <Button danger type="text" icon={<DeleteOutlined style={{ fontSize: 18 }} />} />
        </Popconfirm>
      ),
    },
  ];

  const totalCost = dataSource.reduce((acc, row) => acc + row.totalPrice, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button type="dashed" onClick={addRow}>
          ➕ Thêm dòng
        </Button>
        <Upload beforeUpload={handleUpload} accept=".xlsx,.csv" showUploadList={false}>
          <Button icon={<UploadOutlined />}>Tải file Excel</Button>
        </Upload>
      </div>

      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        rowKey="key"
        bordered
      />

      <div style={{ textAlign: 'right', marginTop: 16, fontWeight: 'bold' }}>
        Tổng tiền: {totalCost.toLocaleString()}₫
      </div>
      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Button type="primary" onClick={handleSubmit}>Nhập kho</Button>
      </div>
    </div>
  );
};

export default InventoryTable;
