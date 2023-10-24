import { StyleSheet, View, Pressable, Text, Image } from 'react-native';

import { useState } from 'react';



export default function Button({ label, style, hoverStyle, iconStyle, icon, svg, onClick, disabled }) {
    const [hover, setHover] = useState(false);

    return (

        <Pressable style={[styles.button, style]} onPress={onClick} disabled={disabled} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <View style={[styles.button, hoverStyle, disabled ? styles.disabled : (hover ? styles.hover : {})]} >

                <Icon svg={svg} style={iconStyle} icon={icon} disabled={disabled} />
                <ButtonText disabled={disabled} label={label} />
            </View>

        </Pressable>

    );
}

function Icon(props) {
    if (props.svg) {
        return (
            <props.svg style={[styles.icon, props.style, props.disabled ? styles.buttonLabelDisabled : styles.buttonLabel]} />
        );
    }
    else if (props.icon) {
        return (
            <Image source={props.icon} style={[styles.icon, props.style, props.disabled ? styles.buttonLabelDisabled : styles.buttonLabel]} />
        );
    } else {
        return;
    }
}

function ButtonText(props) {
    if (props.label) {
        return (
            <Text style={[styles.h5, props.disabled ? styles.buttonLabelDisabled : styles.buttonLabel]} >{props.label}</Text>
        );
    } else {
        return;
    }
}

const styles = StyleSheet.create({
    disabled: {
        backgroundColor: "#66666633",
    },
    hover: {
        backgroundColor: "#cccccc55"
    },
    h5: {
        padding: '.416em',
        fontSize: '.83em',
        fontWeight: 'bolder'
    },
    button: {
        borderRadius: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonIcon: {
        paddingRight: 8,
    },
    buttonLabel: {
        color: '#FFF',
    },
    buttonLabelDisabled: {
        color: '#dfdfdf',
    },
    icon: {
        aspectRatio: 1,
        justifyContent: 'flex-start',
        height: '100%',
    },
});
