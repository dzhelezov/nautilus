import React from 'react';
import { connect } from 'react-redux';
import css from './index.scss';
import classNames from 'classnames';
import images from 'ui/images/ic1.png';



class HelixCoin extends React.PureComponent {
    render() {
        return (
            <div>
                <section className={css.home}>

                    <div className={classNames(css.top_sec)}>
                        <div className={classNames(css.bal_bx)}>Balance<br /><span>0,02€ /mHLX</span></div>
                        <div className={classNames(css.bal_bxs)}>1337,00 &nbsp; mHLX<br /><span>26,67 &nbsp; EUR</span></div>

                        <a href="#" className={classNames(css.main_mn)}><img src="" alt="" /></a>
                        <a href="#" className={classNames(css.setting)}><img src="" alt="" />Logout <span>></span></a>
                        <a href="#" className={classNames(css.setting)}><img src="" alt="" />Settings<span>></span></a>
                        <a href="#" className={classNames(css.setting)}><img src="" alt="" />Main Menu<span>></span></a>
                    </div>
                    <div className={classNames(css.pg1_foo3)}>
                        <div className="container">
                            <div className="row">

                                <div className="col-lg-12">
                                    <div className={classNames(css.foo_bxx)}>
                                        <h3 >Send HLX Coins<span>.</span></h3>
                                        <h6>Please note once funds are submitted, the transactions are irrevocable!</h6>
                                        <div className={classNames(css.bbx_box, css.tr_box)}>
                                            <span className={classNames(css.er1)}>EUR</span>
                                            <span className={classNames(css.er2)}>26,74</span>
                                        </div>
                                        <div className={classNames(css.bbx_box)}>
                                            <span className={classNames(css.er1)}>mHLX</span>
                                            <span className={classNames(css.er2)}>1337,00</span>
                                        </div>
                                        <h5>Enter Receiver Address</h5>
                                        <input type="text" name="name" className={classNames(css.reci_text)} /> <br />
                                        <a href="#" className={classNames(css.send_bts)}><img src="" alt="" /> <br />send ></a>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                
                
                    <ul>
                        <li className={classNames(css.footer)}><a href="#">0</a></li>
                        <li><a href="#">1</a></li>
                        <li><a href="#">2</a></li>
                        <li><a href="#">3</a></li>
                        <li><a href="#">4</a></li>
                        <li className="db_none"><a href="#">5</a></li>
                    </ul>
                                </section>
            </div>
        )
    }
}
const mapDispatchToProps = {

};
export default connect(null, mapDispatchToProps)(HelixCoin);