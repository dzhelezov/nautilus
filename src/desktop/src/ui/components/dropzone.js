import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import classNames from 'classnames';
import shield from '../../ui/images/svg/shield.svg';
import Icon from 'ui/components/icon';

import css from './dropzone.scss';

/**
 * File drag & drop component
 */
class Dropzone extends React.Component {
    static propTypes = {
        /** Succesfull file drop callback
         * @param {buffer} FileBuffer - Droped file content buffer
         * @returns {undefined}
         */
        onDrop: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props, context) {
        super(props, context);

        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);

        this.state = {
            isDragActive: false,
        };
    }

    componentWillMount() {
        document.addEventListener('dragenter', this.onDragEnter);
        document.addEventListener('dragover', this.onDragOver);
        document.addEventListener('dragleave', this.onDragLeave);
        document.addEventListener('drop', this.onDrop);
    }

    componentDidMount() {
        this.parentCount = 0;
    }

    componentWillUnmount() {
        document.removeEventListener('dragenter', this.onDragEnter);
        document.removeEventListener('dragover', this.onDragOver);
        document.removeEventListener('dragleave', this.onDragLeave);
        document.removeEventListener('drop', this.onDrop);
    }

    onDragEnter(e) {
        e.preventDefault();

        ++this.parentCount;

        this.setState({
            isDragActive: true,
        });
    }

    onDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    onDragLeave(e) {
        e.preventDefault();

        if (--this.parentCount > 0) {
            return;
        }

        this.setState({
            isDragActive: false,
        });
    }

    onDrop(e) {
        e.stopPropagation();
        e.preventDefault();

        const { onDrop } = this.props;

        this.setState({
            isDragActive: false,
        });

        this.parentCount = 0;

        const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

        if (!file || file.size > 100000) {
            return onDrop(null);
        }

        const reader = new FileReader();

        // Init with empty buffer first
        onDrop([]);

        reader.onload = (e) => {
            const buffer = e.target.result;
            onDrop(buffer);
        };

        reader.readAsArrayBuffer(file);
    }

    open = () => {
        this.fileInput.value = null;
        this.fileInput.click();
    };

    render() {
        const { t } = this.props;
        const inputAttributes = {
            type: 'file',
            style: { display: 'none' },
            multiple: false,
            onChange: this.onDrop,
            ref: (el) => {
                this.fileInput = el;
            },
        };

        return (
            <React.Fragment>
                <h5 style={{position:'absolute',top:'-70px'}} onClick={this.open}>
                    {/* <Icon icon="seedVault" size={48} color='red'/> */}
                    <img style={{width: "86px"}}  src={shield} alt="" />{' '}
                    <br/>
                    <span style={{fontSize:'14px'}}>
                        {t('seedVault:dropInstructions')}
                    </span>
                </h5>
                <input {...inputAttributes} />
                <div className={classNames(css.dropzone, this.state.isDragActive && css.active)}>
                <img style={{width: "150px"}}  src={shield} alt="" />
                    <h1>{t('seedVault:dropInstructions')}</h1>
                </div>
            </React.Fragment>
        );
    }
}

export default connect()(translate()(Dropzone));