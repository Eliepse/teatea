import { createContext, type PropsWithChildren, useContext, useMemo } from "react";
import { useNavigate } from "react-router";
import { useToken } from "~/auth/hooks/useToken";
import { useUser } from "~/auth/hooks/useUser";

const AuthContext = createContext<{ token: ReturnType<typeof useToken>[0] }>({ token: null });

export function AuthProvider(props: PropsWithChildren) {
	const [token, _, clearToken] = useToken();
	const userQuery = useUser();
	const navigate = useNavigate();

	function logout() {
		clearToken();
		navigate("/", { replace: true });
	}

	const value = useMemo(
		() => ({
			token,
			user: userQuery.data,
		}),
		[token, userQuery.data],
	);

	return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}
