module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [
        [
          "module-resolver",
          {
            alias: {
              // This needs to be mirrored in tsconfig.json
              atoms: "./src/components/Atoms",
              molecules: "./src/components/Molecules",
              organisms: "./src/components/Organisms",
              routes: "./src/routes",
              screens: "./src/screens",
              services: "./src/services",
              styles: "./src/styles",
              themes: "./src/themes",
              types: "./src/types",
              utils: "./src/utils",
              src: "./src",
            },
          },
        ],
        "react-native-reanimated/plugin",
      ],
    };
  };