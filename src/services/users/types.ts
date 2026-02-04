export interface RoleDTO {
	id: string;
	code: string;
}

export interface UserDTO {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	username?: string;
	role: RoleDTO;
}
