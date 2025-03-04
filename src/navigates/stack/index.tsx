import { createStackNavigator } from "@react-navigation/stack";
import DetailScreen from "@screens/Detail";
import { ROUTES } from "@routes/index";
import BottomTabsNavigation from "../bottomTabs";

const Stack = createStackNavigator();

const StackNavigation = ({ route }: any) => {

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="MainTabs"
                component={BottomTabsNavigation}
                initialParams={{ screen: route?.params?.screen || ROUTES.HOME }}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={ROUTES.DETAILS}
                component={DetailScreen}
                options={{ headerShown: true }}
            />
        </Stack.Navigator>
    )
}

export default StackNavigation;