const ADD_SHIP = 'add-ship';

export const addShipQueryKey = (...args: unknown[]) => {
	return [ADD_SHIP, args];
};
