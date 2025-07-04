import { createContext, type PropsWithChildren, useContext, useMemo } from "react";
import { useNavigate } from "react-router";
import { useToken } from "~/auth/hooks/useToken";

const AuthContext = createContext<{ token: string | null }>({ token: null });

export function AuthProvider(props: PropsWithChildren) {
	const [token, _, clearToken] = useToken();
	const navigate = useNavigate();

	function logout() {
		clearToken();
		navigate("/", { replace: true });
	}

	const value = useMemo(
		() => ({
			token
		}),
		[token]
	);

	return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}
