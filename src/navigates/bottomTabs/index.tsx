import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ROUTES } from "@routes/index";
import FavoriteScreen from "@screens/Favorite";
import HomeScreen from "@screens/Home";
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import getTabBarIcon from "@atoms/Icon";

const BottomTab = createBottomTabNavigator();

const BottomTabsNavigation = () => {
    return (
        <BottomTab.Navigator screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: "#fff", borderTopWidth: 0, height: 60 },
            tabBarActiveTintColor: "#FF5733",
            tabBarInactiveTintColor: "#999"
        }}>
            <BottomTab.Screen
                name={ROUTES.HOME}
                component={HomeScreen}
                options={{
                    tabBarIcon: getTabBarIcon(Entypo, 'home'),
                }}
            />
            <BottomTab.Screen
                name={ROUTES.FAVORITES}
                component={FavoriteScreen}
                options={{
                    tabBarIcon: getTabBarIcon(MaterialIcons, 'favorite'),
                }}
            />
        </BottomTab.Navigator>
    );
}

export default BottomTabsNavigation;