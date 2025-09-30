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
                                            'data-bs-target="#controllers-links-module-AppModule-b3ae1044a1ce68337c2785e1816e5d05507ba08a49fd830d889469f114480488fc366b885a13a6d9a2a92c5e04becaeb7796d317c745ecf84e86020fcfd0b8de"' : 'data-bs-target="#xs-controllers-links-module-AppModule-b3ae1044a1ce68337c2785e1816e5d05507ba08a49fd830d889469f114480488fc366b885a13a6d9a2a92c5e04becaeb7796d317c745ecf84e86020fcfd0b8de"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-b3ae1044a1ce68337c2785e1816e5d05507ba08a49fd830d889469f114480488fc366b885a13a6d9a2a92c5e04becaeb7796d317c745ecf84e86020fcfd0b8de"' :
                                            'id="xs-controllers-links-module-AppModule-b3ae1044a1ce68337c2785e1816e5d05507ba08a49fd830d889469f114480488fc366b885a13a6d9a2a92c5e04becaeb7796d317c745ecf84e86020fcfd0b8de"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-b3ae1044a1ce68337c2785e1816e5d05507ba08a49fd830d889469f114480488fc366b885a13a6d9a2a92c5e04becaeb7796d317c745ecf84e86020fcfd0b8de"' : 'data-bs-target="#xs-injectables-links-module-AppModule-b3ae1044a1ce68337c2785e1816e5d05507ba08a49fd830d889469f114480488fc366b885a13a6d9a2a92c5e04becaeb7796d317c745ecf84e86020fcfd0b8de"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-b3ae1044a1ce68337c2785e1816e5d05507ba08a49fd830d889469f114480488fc366b885a13a6d9a2a92c5e04becaeb7796d317c745ecf84e86020fcfd0b8de"' :
                                        'id="xs-injectables-links-module-AppModule-b3ae1044a1ce68337c2785e1816e5d05507ba08a49fd830d889469f114480488fc366b885a13a6d9a2a92c5e04becaeb7796d317c745ecf84e86020fcfd0b8de"' }>
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
                                            'data-bs-target="#controllers-links-module-AuthModule-8d0626afd79c05ce785ef8114e24ca32bcbb23803225659b73b87ad9d072872d8a7d55258fb973be479dc817da75e4b7d28a36e982b63128e8e89c1df7989680"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-8d0626afd79c05ce785ef8114e24ca32bcbb23803225659b73b87ad9d072872d8a7d55258fb973be479dc817da75e4b7d28a36e982b63128e8e89c1df7989680"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-8d0626afd79c05ce785ef8114e24ca32bcbb23803225659b73b87ad9d072872d8a7d55258fb973be479dc817da75e4b7d28a36e982b63128e8e89c1df7989680"' :
                                            'id="xs-controllers-links-module-AuthModule-8d0626afd79c05ce785ef8114e24ca32bcbb23803225659b73b87ad9d072872d8a7d55258fb973be479dc817da75e4b7d28a36e982b63128e8e89c1df7989680"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-8d0626afd79c05ce785ef8114e24ca32bcbb23803225659b73b87ad9d072872d8a7d55258fb973be479dc817da75e4b7d28a36e982b63128e8e89c1df7989680"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-8d0626afd79c05ce785ef8114e24ca32bcbb23803225659b73b87ad9d072872d8a7d55258fb973be479dc817da75e4b7d28a36e982b63128e8e89c1df7989680"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-8d0626afd79c05ce785ef8114e24ca32bcbb23803225659b73b87ad9d072872d8a7d55258fb973be479dc817da75e4b7d28a36e982b63128e8e89c1df7989680"' :
                                        'id="xs-injectables-links-module-AuthModule-8d0626afd79c05ce785ef8114e24ca32bcbb23803225659b73b87ad9d072872d8a7d55258fb973be479dc817da75e4b7d28a36e982b63128e8e89c1df7989680"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SocialAccountsModule.html" data-type="entity-link" >SocialAccountsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SocialAccountsModule-8ad83f41291d69a09811977fad4ecfba4656aee6bc1f84c092d98e83a61d3b0d71fc788695fd46519e914a51dd8dcb949289f765cf81267a4f6d75284f096b52"' : 'data-bs-target="#xs-controllers-links-module-SocialAccountsModule-8ad83f41291d69a09811977fad4ecfba4656aee6bc1f84c092d98e83a61d3b0d71fc788695fd46519e914a51dd8dcb949289f765cf81267a4f6d75284f096b52"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SocialAccountsModule-8ad83f41291d69a09811977fad4ecfba4656aee6bc1f84c092d98e83a61d3b0d71fc788695fd46519e914a51dd8dcb949289f765cf81267a4f6d75284f096b52"' :
                                            'id="xs-controllers-links-module-SocialAccountsModule-8ad83f41291d69a09811977fad4ecfba4656aee6bc1f84c092d98e83a61d3b0d71fc788695fd46519e914a51dd8dcb949289f765cf81267a4f6d75284f096b52"' }>
                                            <li class="link">
                                                <a href="controllers/SocialAccountsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SocialAccountsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SocialAccountsModule-8ad83f41291d69a09811977fad4ecfba4656aee6bc1f84c092d98e83a61d3b0d71fc788695fd46519e914a51dd8dcb949289f765cf81267a4f6d75284f096b52"' : 'data-bs-target="#xs-injectables-links-module-SocialAccountsModule-8ad83f41291d69a09811977fad4ecfba4656aee6bc1f84c092d98e83a61d3b0d71fc788695fd46519e914a51dd8dcb949289f765cf81267a4f6d75284f096b52"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SocialAccountsModule-8ad83f41291d69a09811977fad4ecfba4656aee6bc1f84c092d98e83a61d3b0d71fc788695fd46519e914a51dd8dcb949289f765cf81267a4f6d75284f096b52"' :
                                        'id="xs-injectables-links-module-SocialAccountsModule-8ad83f41291d69a09811977fad4ecfba4656aee6bc1f84c092d98e83a61d3b0d71fc788695fd46519e914a51dd8dcb949289f765cf81267a4f6d75284f096b52"' }>
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
                                            'data-bs-target="#controllers-links-module-UsersModule-58c8e7a3430d3d2bd6a4aeaa6c28cf6870bde926e1c75b83057bc5673b499ad0194db3918ff1fc0fe2732aa026ff70967d9df110e1d795468d44b445445e94d4"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-58c8e7a3430d3d2bd6a4aeaa6c28cf6870bde926e1c75b83057bc5673b499ad0194db3918ff1fc0fe2732aa026ff70967d9df110e1d795468d44b445445e94d4"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-58c8e7a3430d3d2bd6a4aeaa6c28cf6870bde926e1c75b83057bc5673b499ad0194db3918ff1fc0fe2732aa026ff70967d9df110e1d795468d44b445445e94d4"' :
                                            'id="xs-controllers-links-module-UsersModule-58c8e7a3430d3d2bd6a4aeaa6c28cf6870bde926e1c75b83057bc5673b499ad0194db3918ff1fc0fe2732aa026ff70967d9df110e1d795468d44b445445e94d4"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-58c8e7a3430d3d2bd6a4aeaa6c28cf6870bde926e1c75b83057bc5673b499ad0194db3918ff1fc0fe2732aa026ff70967d9df110e1d795468d44b445445e94d4"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-58c8e7a3430d3d2bd6a4aeaa6c28cf6870bde926e1c75b83057bc5673b499ad0194db3918ff1fc0fe2732aa026ff70967d9df110e1d795468d44b445445e94d4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-58c8e7a3430d3d2bd6a4aeaa6c28cf6870bde926e1c75b83057bc5673b499ad0194db3918ff1fc0fe2732aa026ff70967d9df110e1d795468d44b445445e94d4"' :
                                        'id="xs-injectables-links-module-UsersModule-58c8e7a3430d3d2bd6a4aeaa6c28cf6870bde926e1c75b83057bc5673b499ad0194db3918ff1fc0fe2732aa026ff70967d9df110e1d795468d44b445445e94d4"' }>
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
                                    <a href="controllers/SocialAccountsController.html" data-type="entity-link" >SocialAccountsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UsersController.html" data-type="entity-link" >UsersController</a>
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
                                <a href="classes/GetAllUsersParamDto.html" data-type="entity-link" >GetAllUsersParamDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetOneUserParamDto.html" data-type="entity-link" >GetOneUserParamDto</a>
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
                                <a href="classes/SelectChannelDto.html" data-type="entity-link" >SelectChannelDto</a>
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
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
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