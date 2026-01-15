import { RouteObject, RouterProvider, createHashRouter } from 'react-router-dom';
import { AuthenticatedLayout, DevLayout, FleetReportTable, MainFormLayout } from '~components/organisms';
import { AddAgentShipPage, AddFleetPage, AddOurShipPage, ErrorPage, LoginPage, ReportPage, UsersPage } from '~pages';
import { EPaths } from './types';

const LOGIN_ROUTE: RouteObject = {
	path: EPaths.LOGIN,
	element: <LoginPage />,
};

const REPORT_ROUTS: RouteObject = {
	path: EPaths.REPORT,
	element: <ReportPage />,
};

// New route for updating a ship report using the AddOurShipPage
const REPORT_UPDATE_ROUTE: RouteObject = {
	path: '/report/update/:id',
	element: <AddOurShipPage />,
};

const MAIN_FORMS_ROUTES: RouteObject[] = [
	{
		path: EPaths.ADD_OUR_SHIP,
		element: <AddOurShipPage />,
	},
	{
		path: EPaths.ADD_AGENT_SHIP,
		element: <AddAgentShipPage />,
	},
	{
		path: EPaths.ADD_FLEET,
		element: <AddFleetPage />,
	},
	{
		path: EPaths.FLEETS_REPORT,
		element: <FleetReportTable />,
	},
];

const ADMIN_ROUTES: RouteObject[] = [
	{
		path: EPaths.ROOT,
		element: <AuthenticatedLayout />,
		children: [
			{
				path: EPaths.USERS,
				element: <UsersPage />,
			},
		],
	},
];

const router = createHashRouter([
	{
		path: EPaths.ROOT,
		element: <DevLayout />,
		errorElement: <ErrorPage />,
		children: [
			LOGIN_ROUTE,
			{
				element: <MainFormLayout />,
				children: [...MAIN_FORMS_ROUTES, REPORT_ROUTS, REPORT_UPDATE_ROUTE, ...ADMIN_ROUTES],
			},
		],
	},
]);

export const routes = <RouterProvider router={router} />;
