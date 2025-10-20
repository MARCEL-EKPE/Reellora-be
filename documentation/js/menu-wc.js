'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">reellora-be documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-d2a2e6064bb1ddd5098f04ca1b4caae3ef54e10521c61052d1e935847da6387b6007338e6f974fe3a2b3f08988c4c79facc69ad6e9defe8b7152634e4f0951f5"' : 'data-bs-target="#xs-controllers-links-module-AppModule-d2a2e6064bb1ddd5098f04ca1b4caae3ef54e10521c61052d1e935847da6387b6007338e6f974fe3a2b3f08988c4c79facc69ad6e9defe8b7152634e4f0951f5"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-d2a2e6064bb1ddd5098f04ca1b4caae3ef54e10521c61052d1e935847da6387b6007338e6f974fe3a2b3f08988c4c79facc69ad6e9defe8b7152634e4f0951f5"' :
                                            'id="xs-controllers-links-module-AppModule-d2a2e6064bb1ddd5098f04ca1b4caae3ef54e10521c61052d1e935847da6387b6007338e6f974fe3a2b3f08988c4c79facc69ad6e9defe8b7152634e4f0951f5"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-d2a2e6064bb1ddd5098f04ca1b4caae3ef54e10521c61052d1e935847da6387b6007338e6f974fe3a2b3f08988c4c79facc69ad6e9defe8b7152634e4f0951f5"' : 'data-bs-target="#xs-injectables-links-module-AppModule-d2a2e6064bb1ddd5098f04ca1b4caae3ef54e10521c61052d1e935847da6387b6007338e6f974fe3a2b3f08988c4c79facc69ad6e9defe8b7152634e4f0951f5"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-d2a2e6064bb1ddd5098f04ca1b4caae3ef54e10521c61052d1e935847da6387b6007338e6f974fe3a2b3f08988c4c79facc69ad6e9defe8b7152634e4f0951f5"' :
                                        'id="xs-injectables-links-module-AppModule-d2a2e6064bb1ddd5098f04ca1b4caae3ef54e10521c61052d1e935847da6387b6007338e6f974fe3a2b3f08988c4c79facc69ad6e9defe8b7152634e4f0951f5"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-30dee23c0af2a2bed955d138c76b5bc7e73b4f9f69768272d843409ab77afb73f2cedccbdd9df2bef43bb16850c9403fdf31f4577230e571c684da61c46c1503"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-30dee23c0af2a2bed955d138c76b5bc7e73b4f9f69768272d843409ab77afb73f2cedccbdd9df2bef43bb16850c9403fdf31f4577230e571c684da61c46c1503"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-30dee23c0af2a2bed955d138c76b5bc7e73b4f9f69768272d843409ab77afb73f2cedccbdd9df2bef43bb16850c9403fdf31f4577230e571c684da61c46c1503"' :
                                            'id="xs-controllers-links-module-AuthModule-30dee23c0af2a2bed955d138c76b5bc7e73b4f9f69768272d843409ab77afb73f2cedccbdd9df2bef43bb16850c9403fdf31f4577230e571c684da61c46c1503"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/FacebookAuthenticationController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FacebookAuthenticationController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/GoogleAuthenticationController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GoogleAuthenticationController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-30dee23c0af2a2bed955d138c76b5bc7e73b4f9f69768272d843409ab77afb73f2cedccbdd9df2bef43bb16850c9403fdf31f4577230e571c684da61c46c1503"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-30dee23c0af2a2bed955d138c76b5bc7e73b4f9f69768272d843409ab77afb73f2cedccbdd9df2bef43bb16850c9403fdf31f4577230e571c684da61c46c1503"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-30dee23c0af2a2bed955d138c76b5bc7e73b4f9f69768272d843409ab77afb73f2cedccbdd9df2bef43bb16850c9403fdf31f4577230e571c684da61c46c1503"' :
                                        'id="xs-injectables-links-module-AuthModule-30dee23c0af2a2bed955d138c76b5bc7e73b4f9f69768272d843409ab77afb73f2cedccbdd9df2bef43bb16850c9403fdf31f4577230e571c684da61c46c1503"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FacebookAuthenticationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FacebookAuthenticationService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GenerateTokensProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GenerateTokensProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GoogleAuthenticationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GoogleAuthenticationService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RefreshTokensProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RefreshTokensProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SignInProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SignInProvider</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SocialAccountsModule.html" data-type="entity-link" >SocialAccountsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SocialAccountsModule-ebd94b5d1371781f9baddc4887471604fb5e9564b80f5c0403f1ed19326d118984eac76f4d4e6feadfc0f532c114027bdfca85ad6fcdefe07ff54459787bac0f"' : 'data-bs-target="#xs-controllers-links-module-SocialAccountsModule-ebd94b5d1371781f9baddc4887471604fb5e9564b80f5c0403f1ed19326d118984eac76f4d4e6feadfc0f532c114027bdfca85ad6fcdefe07ff54459787bac0f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SocialAccountsModule-ebd94b5d1371781f9baddc4887471604fb5e9564b80f5c0403f1ed19326d118984eac76f4d4e6feadfc0f532c114027bdfca85ad6fcdefe07ff54459787bac0f"' :
                                            'id="xs-controllers-links-module-SocialAccountsModule-ebd94b5d1371781f9baddc4887471604fb5e9564b80f5c0403f1ed19326d118984eac76f4d4e6feadfc0f532c114027bdfca85ad6fcdefe07ff54459787bac0f"' }>
                                            <li class="link">
                                                <a href="controllers/SocialAccountsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SocialAccountsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SocialAccountsModule-ebd94b5d1371781f9baddc4887471604fb5e9564b80f5c0403f1ed19326d118984eac76f4d4e6feadfc0f532c114027bdfca85ad6fcdefe07ff54459787bac0f"' : 'data-bs-target="#xs-injectables-links-module-SocialAccountsModule-ebd94b5d1371781f9baddc4887471604fb5e9564b80f5c0403f1ed19326d118984eac76f4d4e6feadfc0f532c114027bdfca85ad6fcdefe07ff54459787bac0f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SocialAccountsModule-ebd94b5d1371781f9baddc4887471604fb5e9564b80f5c0403f1ed19326d118984eac76f4d4e6feadfc0f532c114027bdfca85ad6fcdefe07ff54459787bac0f"' :
                                        'id="xs-injectables-links-module-SocialAccountsModule-ebd94b5d1371781f9baddc4887471604fb5e9564b80f5c0403f1ed19326d118984eac76f4d4e6feadfc0f532c114027bdfca85ad6fcdefe07ff54459787bac0f"' }>
                                        <li class="link">
                                            <a href="injectables/SocialAccountsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SocialAccountsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-c827356d7d3b01d5630207f9af5467b3e56cf616166b26ecc4a10886d6ffc0132f182bccd07f7c96d8ab3f6b8787753653eaacbccff5e6a130c0976e6b17720e"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-c827356d7d3b01d5630207f9af5467b3e56cf616166b26ecc4a10886d6ffc0132f182bccd07f7c96d8ab3f6b8787753653eaacbccff5e6a130c0976e6b17720e"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-c827356d7d3b01d5630207f9af5467b3e56cf616166b26ecc4a10886d6ffc0132f182bccd07f7c96d8ab3f6b8787753653eaacbccff5e6a130c0976e6b17720e"' :
                                            'id="xs-controllers-links-module-UsersModule-c827356d7d3b01d5630207f9af5467b3e56cf616166b26ecc4a10886d6ffc0132f182bccd07f7c96d8ab3f6b8787753653eaacbccff5e6a130c0976e6b17720e"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-c827356d7d3b01d5630207f9af5467b3e56cf616166b26ecc4a10886d6ffc0132f182bccd07f7c96d8ab3f6b8787753653eaacbccff5e6a130c0976e6b17720e"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-c827356d7d3b01d5630207f9af5467b3e56cf616166b26ecc4a10886d6ffc0132f182bccd07f7c96d8ab3f6b8787753653eaacbccff5e6a130c0976e6b17720e"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-c827356d7d3b01d5630207f9af5467b3e56cf616166b26ecc4a10886d6ffc0132f182bccd07f7c96d8ab3f6b8787753653eaacbccff5e6a130c0976e6b17720e"' :
                                        'id="xs-injectables-links-module-UsersModule-c827356d7d3b01d5630207f9af5467b3e56cf616166b26ecc4a10886d6ffc0132f182bccd07f7c96d8ab3f6b8787753653eaacbccff5e6a130c0976e6b17720e"' }>
                                        <li class="link">
                                            <a href="injectables/CreateFacebookUserProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CreateFacebookUserProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CreateGoogleUserProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CreateGoogleUserProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CreateUserProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CreateUserProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FindOneUserByEmailProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FindOneUserByEmailProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FindOneUserByFacebookIdProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FindOneUserByFacebookIdProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FindOneUserByGoogleIdProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FindOneUserByGoogleIdProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AppController.html" data-type="entity-link" >AppController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthController.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/FacebookAuthenticationController.html" data-type="entity-link" >FacebookAuthenticationController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/GoogleAuthenticationController.html" data-type="entity-link" >GoogleAuthenticationController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/SocialAccountsController.html" data-type="entity-link" >SocialAccountsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UsersController.html" data-type="entity-link" >UsersController</a>
                                </li>
                            </ul>
                        </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#entities-links"' :
                                'data-bs-target="#xs-entities-links"' }>
                                <span class="icon ion-ios-apps"></span>
                                <span>Entities</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="entities-links"' : 'id="xs-entities-links"' }>
                                <li class="link">
                                    <a href="entities/SocialAccounts.html" data-type="entity-link" >SocialAccounts</a>
                                </li>
                                <li class="link">
                                    <a href="entities/User.html" data-type="entity-link" >User</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacebookTokenDto.html" data-type="entity-link" >FacebookTokenDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacebookUser.html" data-type="entity-link" >FacebookUser</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetAllUsersParamDto.html" data-type="entity-link" >GetAllUsersParamDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetOneUserParamDto.html" data-type="entity-link" >GetOneUserParamDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GoogleTokenDto.html" data-type="entity-link" >GoogleTokenDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GoogleUser.html" data-type="entity-link" >GoogleUser</a>
                            </li>
                            <li class="link">
                                <a href="classes/LinkYoutubeDto.html" data-type="entity-link" >LinkYoutubeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PatchUserDto.html" data-type="entity-link" >PatchUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PatchUserPreferencesDTo.html" data-type="entity-link" >PatchUserPreferencesDTo</a>
                            </li>
                            <li class="link">
                                <a href="classes/RefreshTokenDto.html" data-type="entity-link" >RefreshTokenDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SelectChannelDto.html" data-type="entity-link" >SelectChannelDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SignInDto.html" data-type="entity-link" >SignInDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserPreferencesDto.html" data-type="entity-link" >UserPreferencesDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AppService.html" data-type="entity-link" >AppService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/Argon2Provider.html" data-type="entity-link" >Argon2Provider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CreateFacebookUserProvider.html" data-type="entity-link" >CreateFacebookUserProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CreateGoogleUserProvider.html" data-type="entity-link" >CreateGoogleUserProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CreateUserProvider.html" data-type="entity-link" >CreateUserProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DataResponseInterceptor.html" data-type="entity-link" >DataResponseInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FacebookAuthenticationService.html" data-type="entity-link" >FacebookAuthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FindOneUserByEmailProvider.html" data-type="entity-link" >FindOneUserByEmailProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FindOneUserByFacebookIdProvider.html" data-type="entity-link" >FindOneUserByFacebookIdProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FindOneUserByGoogleIdProvider.html" data-type="entity-link" >FindOneUserByGoogleIdProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GenerateTokensProvider.html" data-type="entity-link" >GenerateTokensProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GoogleAuthenticationService.html" data-type="entity-link" >GoogleAuthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HashingProvider.html" data-type="entity-link" >HashingProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RefreshTokensProvider.html" data-type="entity-link" >RefreshTokensProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SignInProvider.html" data-type="entity-link" >SignInProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SocialAccountsService.html" data-type="entity-link" >SocialAccountsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersService.html" data-type="entity-link" >UsersService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AccessTokenGuard.html" data-type="entity-link" >AccessTokenGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/AuthenticationGuard.html" data-type="entity-link" >AuthenticationGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/CurrentUser.html" data-type="entity-link" >CurrentUser</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});