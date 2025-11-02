import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RankingsList from './components/RankingsList/RankingsList';
import TeamCard from './components/TeamCard/TeamCard';
import AuthCallback from './components/Auth/AuthCallback';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/auth/callback" element={<AuthCallback />} />
				<Route
					path="/"
					element={
						<div>
							<RankingsList />
							<TeamCard />
						</div>
					}
				/>
			</Routes>
		</Router>
	);
}

export default App;
