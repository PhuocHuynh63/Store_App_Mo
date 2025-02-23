
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ROUTES } from '@routes/index';

type RootStackParamList = {
    [ROUTES.HOME]: undefined;
    [ROUTES.FAVORITES]: undefined;
    [ROUTES.DETAILS]: { id: string };
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
