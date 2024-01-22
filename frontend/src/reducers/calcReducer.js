export const initialCalcState = {
	dx: true,
	vpn: true,
};

export const calcReducer = (state, action) => {
	switch (action.type) {
		case 'TOGGLE_DX':
			return {
				dx: action.payload.dx
			};
		case 'TOGGLE_VPN':
			return {
				vpn: action.payload.vpn
			};
		default:
			return state;
	}
};