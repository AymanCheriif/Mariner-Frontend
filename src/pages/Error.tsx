import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export const ErrorPage = () => {
	const error = useRouteError();

	return (
		<div id="error-page">
			<h1>Oops!</h1>
			<p>Sorry, an unexpected error has occurred.</p>

			{isRouteErrorResponse(error) && (
				<div style={{ color: 'red' }}>
					<p>{error.data}</p>

					<p>
						{error.status} - {error.statusText}
					</p>
				</div>
			)}
		</div>
	);
};
