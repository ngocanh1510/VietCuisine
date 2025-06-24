import { Button, DatePicker, Form, Input, Modal, Space, Table, message, Select } from 'antd';
import moment from 'moment';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Showtimes = () => {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentShowtime, setCurrentShowtime] = useState(null);
    const [form] = Form.useForm();
    const [theaters, setTheaters] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedTheater, setSelectedTheater] = useState(null);

    // Utility function to combine date and time
    const combineDateTime = (date, time) => {
        if (!date || !time) {
            throw new Error('Date or time is undefined');
        }
        return moment(`${date.format('YYYY-MM-DD')}T${time.format('HH:mm')}:00.000Z`).toISOString();
    };

    // Fetch movies from API
    const fetchMovies = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8081/movie/all');
            const movies = response.data.movies || response.data;

            if (!Array.isArray(movies)) throw new Error('API response is not an array');

            const transformedData = movies.map((movie) => ({
                id: movie._id,
                name: movie.title,
            }));

            setMovies(transformedData);
        } catch (error) {
            console.error('Error fetching movies:', error);
            message.error('Failed to fetch movies');
        } finally {
            setLoading(false);
        }
    };

    // Fetch showtimes for selected movie
    const fetchShowtimes = async (movieId) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8081/movie/${movieId}/showtimeIds`);
            const formattedShowtimes = response.data.map((showtime) => ({
                ...showtime,
                date: moment(showtime.date).format('DD/MM/YYYY HH:mm'),
            }));
            setShowtimes(formattedShowtimes || []);
        } catch (error) {
            message.error('Failed to fetch showtimes');
        } finally {
            setLoading(false);
        }
    };

    // Create a new showtime
    const createShowtime = async (values, movieId) => {
        try {
            setLoading(true);
            const dateTime = combineDateTime(values.date, values.time);
            await axios.post(`http://localhost:8081/movie/${movieId}/showtimes`, {
                theaterName: values.theaterName,
                roomName: values.roomName,
                date: dateTime,
                language: values.language,
            });
            await fetchShowtimes(movieId);
            message.success('Showtime created successfully');
        } catch (error) {
            console.error('Error creating showtime:', error);
            message.error('Failed to create showtime');
        } finally {
            setLoading(false);
        }
    };

    // Update an existing showtime
    const updateShowtime = async (movieId, showtimeId, values) => {
        try {
            setLoading(true);
            const dateTime = combineDateTime(values.date, values.time);
            await axios.put(`http://localhost:8081/movie/${movieId}/showtimes/${showtimeId}`, {
                theaterName: values.theaterName,
                roomName: values.roomName,
                date: dateTime,
                language: values.language,
            });
            await fetchShowtimes(movieId);
            message.success('Showtime updated successfully');
        } catch (error) {
            console.error('Error updating showtime:', error);
            message.error('Failed to update showtime');
        } finally {
            setLoading(false);
        }
    };

    // Delete a showtime
    const deleteShowtime = async (id, movieId) => {
        try {
            setLoading(true);
            await axios.delete(`http://localhost:8081/movie/${movieId}/showtimes/${id}`);
            await fetchShowtimes(movieId);
            message.success('Showtime deleted successfully');
        } catch (error) {
            console.error('Error deleting showtime:', error);
            message.error('Failed to delete showtime');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all theaters
    const fetchTheaters = async () => {
        try {
            const response = await axios.get('http://localhost:8081/theater/all');
            setTheaters(response.data);
        } catch (error) {
            console.error('Error fetching theaters:', error);
            message.error('Failed to fetch theaters');
        }
    };

    // Fetch rooms based on selected theater
    const fetchRooms = async (theaterId) => {
        try {
            const response = await axios.get(`http://localhost:8081/theater/${theaterId}/rooms`);
            setRooms(response.data.rooms);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            message.error('Failed to fetch rooms');
        }
    };

    useEffect(() => {
        fetchMovies();
        fetchTheaters();
    }, []);

    useEffect(() => {
        if (selectedMovie) fetchShowtimes(selectedMovie.id);
    }, [selectedMovie]);

    const handleEdit = async (showtime) => {
        try {
            setCurrentShowtime(showtime);

            const dateTime = moment(showtime.date, "DD/MM/YYYY HH:mm");
            const date = moment(dateTime.format('YYYY-MM-DD'));
            const time = moment(dateTime.format('HH:mm'), "HH:mm");

            setSelectedTheater(showtime.screening_room_id.theater_id._id);
            await fetchRooms(showtime.screening_room_id.theater_id._id);

            form.setFieldsValue({
                theaterName: showtime.screening_room_id.theater_id._id,
                roomName: showtime.screening_room_id._id,
                language: showtime.language,
                date,
                time,
            });

            setIsEditMode(true);
            setIsModalVisible(true);
        } catch (error) {
            message.error('Failed to load showtime details');
        }
    };

    const handleDelete = async (id) => {
        await deleteShowtime(id, selectedMovie.id);
    };

    const handleAdd = () => {
        setIsEditMode(false);
        setIsModalVisible(true);
        form.resetFields();
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (isEditMode) {
                await updateShowtime(selectedMovie.id, currentShowtime._id, values);
            } else {
                await createShowtime(values, selectedMovie.id);
            }
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error(error);
            message.error('Please check the form inputs');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleTheaterChange = (theaterId) => {
        setSelectedTheater(theaterId);
        form.setFieldsValue({ roomName: undefined });
        fetchRooms(theaterId);
    };

    const movieColumns = [
        {
            title: 'Movie Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button onClick={() => setSelectedMovie(record)}>Manage Showtimes</Button>
            ),
        },
    ];

    const columns = [
        {
            title: 'Theater Name',
            dataIndex: ['screening_room_id', 'theater_id', 'name'],
            key: 'theaterName',
        },
        {
            title: 'Room Name',
            dataIndex: ['screening_room_id', 'name'],
            key: 'roomName',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Language',
            dataIndex: 'language',
            key: 'language',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => handleEdit(record)}>Edit</Button>
                    <Button onClick={() => handleDelete(record._id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h1>Movie Showtimes Management</h1>
            {!selectedMovie ? (
                <>
                    <h2>Select a Movie</h2>
                    <Table dataSource={movies} columns={movieColumns} rowKey="id" loading={loading} />
                </>
            ) : (
                <>
                    <Space style={{ marginBottom: 16 }}>
                        <Button onClick={() => setSelectedMovie(null)}>Back to Movies</Button>
                        <Button type="primary" onClick={handleAdd}>
                            Add New Showtime
                        </Button>
                    </Space>
                    <h2>Showtimes for {selectedMovie.name}</h2>
                    <Table dataSource={showtimes} columns={columns} rowKey="_id" loading={loading} />
                </>
            )}

            <Modal
                title={isEditMode ? 'Edit Showtime' : 'Add New Showtime'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="theaterName" label="Theater Name" rules={[{ required: true }]}>
                        <Select placeholder="Select a theater" onChange={handleTheaterChange}>
                            {theaters.map((theater) => (
                                <Select.Option key={theater._id} value={theater._id}>
                                    {theater.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="roomName" label="Room Name" rules={[{ required: true }]}>
                        <Select placeholder="Select a room" disabled={!selectedTheater}>
                            {rooms.map((room) => (
                                <Select.Option key={room._id} value={room._id}>
                                    {room.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="language" label="Language" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                        <DatePicker />
                    </Form.Item>
                    <Form.Item name="time" label="Time" rules={[{ required: true }]}>
                        <DatePicker.TimePicker format="HH:mm" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Showtimes;
