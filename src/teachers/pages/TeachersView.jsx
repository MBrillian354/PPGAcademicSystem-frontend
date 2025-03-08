import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';

import Modal from '../../shared/Components/UIElements/ModalBottomClose';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import { Trash2, Search, Users, Pencil, Trash, ChevronDown, Filter, PlusIcon } from 'lucide-react';
import FloatingMenu from '../../shared/Components/UIElements/FloatingMenu';
import WarningCard from '../../shared/Components/UIElements/WarningCard';
import DataTable from '../../shared/Components/UIElements/DataTable';

const TeachersView = () => {
    const [teachers, setTeachers] = useState()
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const { isLoading, sendRequest } = useHttp();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    useEffect(() => {
        const url = auth.userRole === 'admin'
            ? `${import.meta.env.VITE_BACKEND_URL}/teachers`
            : `${import.meta.env.VITE_BACKEND_URL}/teachers/teaching-group/${auth.userTeachingGroupId}`;

        console.log(url)
        const fetchTeachers = async () => {
            try {
                const responseData = await sendRequest(url);
                setTeachers(responseData.teachers);
                console.log(responseData.teachers)
                console.log(auth.userTeachingGroupId)

            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchTeachers();
    }, [sendRequest]);

    const getInitials = (gender) => {
        return gender
            ?.split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const columns = [
        {
            key: 'image',
            label: '',
            render: (teacher) => (
                teacher.image ? (
                    <img
                        src={`${import.meta.env.VITE_BACKEND_URL}/${teacher.image}`}
                        alt={teacher.name}
                        className="size-10 rounded-full m-auto min-w-10"
                    />
                ) : (
                    <div className="size-10 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium m-auto">
                        {getInitials(teacher.name)}
                    </div>
                )
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (teacher) => (
                <div className={`py-1 px-2 text-sm text-center w-min border rounded-md ${teacher.positionEndDate ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'}`}>
                    {teacher.positionEndDate ? 'Tidak Aktif' : 'Aktif'}
                </div>
            )
        },
        { key: 'nig', label: 'NIG', sortable: true },
        { key: 'name', label: 'Nama', sortable: true },
        ...(auth.userRole === 'admin' ? [
            { 
                key: 'branch', 
                label: 'Desa',
                render: (teacher) => teacher?.userId?.teachingGroupId?.branchId?.name
            },
            { 
                key: 'group', 
                label: 'Kelompok',
                render: (teacher) => teacher?.userId?.teachingGroupId?.name
            }
        ] : []),
        {
            key: 'isProfileComplete',
            label: 'Profile',
            render: (teacher) => (
                <span className={teacher.isProfileComplete ? 'text-green-500' : 'text-red-500 hover:underline cursor-pointer'}>
                    {teacher.isProfileComplete ? 'Lengkap' : 'Lengkapi'}
                </span>
            )
        }
    ];

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className='max-w-6xl mx-auto'>
                <div className="flex flex-col justify-between items-start gap-2 mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar Tenaga Pendidik</h1>
                    <WarningCard className="items-center justify-start" warning="Penambahan Tenaga Pendidik Baru Supaya Menghubungi Daerah!" onClear={() => setError(null)} />
                </div>
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {teachers && (
                    <DataTable
                        data={teachers}
                        columns={columns}
                        onRowClick={(teacher) => navigate(`/dashboard/teachers/${teacher._id}`)}
                        searchableColumns={['name', 'nig']}
                        initialSort={{ key: 'name', direction: 'ascending' }}
                    />
                )}
            </div>
        </div>
    );
};

export default TeachersView;