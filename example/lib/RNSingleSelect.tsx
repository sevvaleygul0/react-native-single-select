import * as React from "react";
import {
  Text,
  View,
  Image,
  Easing,
  FlatList,
  Animated,
  ViewStyle,
  TextStyle,
  TextInput,
  ImageStyle,
  LayoutAnimation,
  TouchableOpacity,
  TouchableHighlight,
} from "react-native";
/**
 * ? Local Imports
 */
import Icon from "./components/Icon";
import styles, {
  _imageStyle,
  _menuBarContainer,
  _menuItemContainer,
  _menuItemTextStyle,
  _menuButtonContainer,
  _placeholderTextStyle,
} from "./RNSingleSelect.style";
import { ThemeColors, DARK, LIGHT } from "./theme";

export interface ISingleSelectDataType {
  id: number;
  value: string;
  imageSource?: any;
  data?: any;
}

interface IProps {
  width?: number;
  height?: number;
  darkMode?: boolean;
  imageWidth?: number;
  imageHeight?: number;
  placeholder?: string;
  ImageComponent?: any;
  TextComponent?: any;
  disableAbsolute?: boolean;
  arrowImageStyle?: ImageStyle;
  menuItemTextStyle?: TextStyle;
  menuBarContainerWidth?: number;
  menuBarContainerHeight?: number;
  disableFilterAnimation: boolean;
  buttonContainerStyle?: ViewStyle;
  menuBarContainerStyle?: ViewStyle;
  data?: Array<ISingleSelectDataType>;
  onSelect: (selectedItem: ISingleSelectDataType) => void;
}

let iconRef: any = undefined;
const RNSingleSelect = (props: IProps) => {
  const [
    selectedItem,
    setSelectedItem,
  ] = React.useState<ISingleSelectDataType | null>(null);
  const [menuToggled, setMenuToggled] = React.useState<boolean | null>(false);
  const [dataBackup, setDataBackup] = React.useState<
    Array<ISingleSelectDataType> | undefined
  >(props.data);
  const [dataSource, setDataSource] = React.useState<
    Array<ISingleSelectDataType> | undefined
  >(props.data);
  const [borderRadiusAnimation, setBorderRadiusAnimation] = React.useState<
    Animated.Value
  >(new Animated.Value(16));
  const [
    menuBarYTranslateAnimation,
    setMenuBarYTranslateAnimation,
  ] = React.useState<Animated.Value>(new Animated.Value(0));
  const [theme, setTheme] = React.useState(DARK);

  const {
    menuBarContainerHeight = 150,
    menuBarContainerWidth = 250,
    disableAbsolute = false,
    ImageComponent = Image,
    TextComponent = Text,
    disableFilterAnimation = false,
  } = props;

  React.useEffect(() => {
    if (props.darkMode) setTheme(DARK);
    else setTheme(LIGHT);
  }, []);

  const animateBorderRadius = () => {
    Animated.timing(borderRadiusAnimation, {
      toValue: menuToggled ? 16 : 0,
      duration: 1250,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start();
  };

  const animateSelectionBar = () => {
    Animated.timing(menuBarYTranslateAnimation, {
      toValue: menuToggled ? 0 : 100,
      duration: 250,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const handleOnToggleMenuBar = (isMenuToggled?: boolean) => {
    iconRef?.onPressAnimation();
    animateBorderRadius();
    animateSelectionBar();
    setMenuToggled(isMenuToggled ? isMenuToggled : !menuToggled);
  };

  const handleOnSelectItem = (item: ISingleSelectDataType) => {
    handleOnFilter("");
    setSelectedItem(item);
    handleOnToggleMenuBar();
    props.onSelect && props.onSelect(item);
  };

  const triggerFilterAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 1000,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 1,
      },
      delete: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 1,
      },
    });
  };

  const handleOnFilter = (text: string) => {
    let newData = dataBackup;
    newData = dataBackup?.filter((item) => {
      const itemData = item.value.toLowerCase();
      const textData = text.toLowerCase();
      return itemData.indexOf(textData) > -1;
    });
    !disableFilterAnimation && triggerFilterAnimation();
    setDataSource(newData);
    setSelectedItem({ value: text });
    setDataSource(newData);
  };

  /* -------------------------------------------------------------------------- */
  /*                               Render Methods                               */
  /* -------------------------------------------------------------------------- */

  const renderSingleSelectButton = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          handleOnToggleMenuBar();
        }}
        {...props}
      >
        <Animated.View
          style={[
            _menuButtonContainer(theme, props.height, props.width),
            {
              borderRadius: borderRadiusAnimation,
            },
            props.buttonContainerStyle,
          ]}
        >
          <View style={styles.buttonContainerGlue}>
            <TextInput
              placeholderTextColor={
                selectedItem
                  ? ThemeColors[theme].textColor
                  : ThemeColors[theme].placeholderColor
              }
              style={_placeholderTextStyle(theme, selectedItem)}
              placeholder={props.placeholder || "Select"}
              onFocus={() => handleOnToggleMenuBar(false)}
              onChangeText={(text: string) => {
                if (text.length === 0) handleOnFilter("");
                else handleOnFilter(text);
              }}
            >
              <TextComponent>{selectedItem?.value}</TextComponent>
            </TextInput>
            <Icon
              theme={theme}
              ref={(ref: Icon) => (iconRef = ref)}
              style={[styles.arrowImageStyle, props.arrowImageStyle]}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderMenuItem = (menuItem: any) => {
    const { index } = menuItem;
    const { id, value, imageSource } = menuItem.item;
    const { data, imageWidth, imageHeight, menuItemTextStyle } = props;
    return (
      <TouchableHighlight
        key={id}
        style={_menuItemContainer(index, data)}
        onPress={() => {
          handleOnSelectItem(menuItem.item);
        }}
      >
        <View style={styles.menuBarItemContainerGlue}>
          {imageSource && (
            <ImageComponent
              resizeMode="contain"
              source={imageSource}
              style={_imageStyle(imageHeight, imageWidth)}
            />
          )}
          <TextComponent style={[_menuItemTextStyle(theme), menuItemTextStyle]}>
            {value}
          </TextComponent>
        </View>
      </TouchableHighlight>
    );
  };

  const renderMenuBar = () => {
    const rotate = menuBarYTranslateAnimation.interpolate({
      inputRange: [0, 25, 50, 75, 100],
      outputRange: [0, 0.5, 0.75, 0.9, 1],
    });
    return (
      <Animated.View
        style={[
          _menuBarContainer(
            theme,
            menuBarContainerHeight,
            menuBarContainerWidth,
          ),
          {
            transform: [{ scaleY: rotate }],
            display: disableAbsolute ? "flex" : menuToggled ? "flex" : "none",
          },
          props.menuBarContainerStyle,
        ]}
      >
        <FlatList data={dataSource} renderItem={renderMenuItem} />
      </Animated.View>
    );
  };

  return (
    <View>
      {renderSingleSelectButton()}
      {renderMenuBar()}
    </View>
  );
};

export default RNSingleSelect;
