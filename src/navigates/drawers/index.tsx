import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import StackNavigation from '../stack';
import { ROUTES } from '@routes/index';
import BottomTabsNavigation from '../bottomTabs';
import DetailScreen from '@screens/Detail';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
    return (
        <Drawer.Navigator
            screenOptions={{
                drawerType: "slide",
                swipeEnabled: true,
                swipeEdgeWidth: 500,
                drawerActiveBackgroundColor: "rgba(0,0,0,0.1)",
                drawerLabelStyle: { fontSize: 16, color: "black" },
            }}
        >
            <Drawer.Screen
                name={ROUTES.HOME}
                component={StackNavigation}
                initialParams={{ screen: ROUTES.HOME }}
                options={{ headerShown: false }}
            />
            <Drawer.Screen
                name={ROUTES.FAVORITES}
                component={StackNavigation}
                initialParams={{ screen: ROUTES.FAVORITES }}
                options={{ headerShown: false }}
            />
            <Drawer.Screen
                name={ROUTES.DETAILS}
                component={DetailScreen}
                options={{
                    headerShown: true,
                    drawerItemStyle: { display: "none" },
                }}
            />
        </Drawer.Navigator>
    )
}

export default DrawerNavigation