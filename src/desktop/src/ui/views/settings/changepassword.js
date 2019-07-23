import React from 'react';
import css from './settings.scss';
import classNames from  'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { Switch, Route ,withRouter} from 'react-router-dom';
import { connect } from 'react-redux';
import { zxcvbn } from 'libs/exports';
import {generateAlert} from 'actions/alerts';
import { setPassword } from 'actions/wallet';
import Button from 'ui/components/button';
import { passwordReasons } from 'libs/password';
import SeedStore from 'libs/seed';
import { hash } from 'libs/crypto';
import Password from 'ui/components/input/password';

/**
 * change password component
 */

 class Changepassword extends React.PureComponent{
     static propTypes= {

        setPassword: PropTypes.func.isRequired,
        accounts: PropTypes.object.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        
     }
     state = {
       passwordCurrent:'',
       passwordNew:'',
       passwordConfirm:'',
    };

    changePassword = async (event) => {
        console.log('show password.........');
        event.preventDefault();

        const { passwordCurrent, passwordNew, passwordConfirm } = this.state;
        const { accounts, setPassword, generateAlert, t } = this.props;

        if (passwordNew !== passwordConfirm) {
            generateAlert(
                'error',
                t('changePassword:passwordsDoNotMatch'),
                t('changePassword:passwordsDoNotMatchExplanation'),
            );
            return;
        }

        const score = zxcvbn(passwordNew);

        if (score.score < 4) {
            const reason = score.feedback.warning
                ? t(`changePassword:${passwordReasons[score.feedback.warning]}`)
                : t('changePassword:passwordTooWeakReason');

            return generateAlert('error', t('changePassword:passwordTooWeak'), reason);
        }

        try {
            const passwordNewHash = await hash(passwordNew);
            const passwordCurrentHash = await hash(passwordCurrent);

            const accountTypes = Object.keys(accounts)
                .map((accountName) => (accounts[accountName].meta ? accounts[accountName].meta.type : 'keychain'))
                .filter((accountType, index, accountTypes) => accountTypes.indexOf(accountType) === index);

            for (let i = 0; i < accountTypes.length; i++) {
                await SeedStore[accountTypes[i]].updatePassword(passwordCurrentHash, passwordNewHash);
            }

            setPassword(passwordNewHash);

            this.setState({
                passwordCurrent: '',
                passwordNew: '',
                passwordConfirm: '',
            });

            generateAlert(
                'success',
                t('changePassword:passwordUpdated'),
                t('changePassword:passwordUpdatedExplanation'),
            );
        } catch (err) {
            generateAlert(
                'error',
                t('changePassword:incorrectPassword'),
                t('changePassword:incorrectPasswordExplanation'),
            );
            return;
        }
    };

     render(){

        const {  t } = this.props;
        const {passwordCurrent,passwordNew,passwordConfirm}=this.state;
     
         return(
            <div>
                    
                    <section className="spage_1">
                        <div className="container">
                        <div className="col-lg-4">
                            <div className={classNames(css.menu_bx)}>
                                
                              
                            </div>

                            </div>
                            <div className="col-lg-8">
                                {/* <div className={classNames(css.set_bx)}> */}
                                    <div className={classNames(css.foo_bxx12)}>
                                        <div cllassname={classNames(css.set_bxac)}>
                                            <form onSubmit={(e) => this.changePassword(e)}>
                                                  <h5 style={{marginLeft:'14vw',marginTop:'7vw'}}>{t('changePassword:currentPassword')}</h5>
                                                  <Password type="text" value={passwordCurrent}  onChange={(value) => this.setState({ passwordCurrent: value })} className={classNames(css.ssetting_textline)}/><br /><br />
                                                  <h5 style={{marginLeft:'14vw',marginTop:'2vw'}}>{t('changePassword:newPassword')}</h5>
                                                  <input type="text"   value={passwordNew}  onChange={(value) => this.setState({ passwordNew: value })} className={classNames(css.ssetting_textline)}></input><br /><br />
                                                  <h5 style={{marginLeft:'14vw',marginTop:'2vw'}}>{t('changePassword:confirmPassword')}</h5>
                                                  <input type="text" value={passwordConfirm}   onChange={(value) => this.setState({ passwordConfirm: value })} className={classNames(css.ssetting_textline)}></input><br /><br />
                                                  <Button  style={{marginLeft:'14vw',marginTop:'1vw'}} type="submit" disabled={!passwordCurrent.length || !passwordNew.length || !passwordConfirm.length}>{t('global:save')}</Button>
                                                  <div  className={classNames(css.spe_bx)}>
                                                  {/* <a href="#" className={classNames(css.spe_boxs)}><img src="images/lock.png" alt=""/><br/>Lorem Ipsum  -></a>
                                                      <hr className={classNames(css.ser_bts)}/>
                                         		      <a href="#" className={classNames(css.ar_btns)}><img src="images/down_ar.png" alt=""/></a> */}
                                                  </div>
                                            </form>
                                        </div>
                                    </div>
                                {/* </div> */}
                            </div>
                        </div>
                    </section>
            </div>
         );
     }
 }
const mapStateToProps = (state) => ({
    accounts: state.accounts.accountInfo,
});

const mapDispatchToProps = {
    generateAlert,
    setPassword,
};
export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Changepassword));