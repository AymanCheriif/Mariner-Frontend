export const API_ENDPOINTS = {
	Login: '/auth/login',
	CreateShip: '/ships',
	Users: '/users',
	CreateUser: '/users',
	UpdateUser: '/users',
	Roles: '/roles',
	Documents: '/documents',
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
