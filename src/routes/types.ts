import { ReactElement } from 'react';
import { TxKeyPath } from '~i18n/types';

export enum EPaths {
	ROOT = '/',
	LOGIN = '/',
	HOME = '/dashboard',
	ADD_OUR_SHIP = '/dashboard',
	ADD_AGENT_SHIP = '/add-agent-ship',
	ADD_FLEET = '/add-fleet',
	REPORT = '/report',
	USERS = '/users',
	FLEETS_REPORT = '/fleets-report',
}

export interface NavigationItem {
	icon?: ReactElement;
	textKey: TxKeyPath;
	path: EPaths;
}
