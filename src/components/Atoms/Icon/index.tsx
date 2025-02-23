const getTabBarIcon = (IconComponent: any, iconName: string) =>
    ({ color }: { color: string }) => <IconComponent name={iconName} size={24} color={color} />;

export default getTabBarIcon;