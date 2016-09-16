$(document).ready(function() {
    'use strict';

    var self = this;

    self.translations = [
        'ru',
        'en'
    ];

    self.userLang = getUserLang(); // Used on page
    self.respLang = getRespLang(); // Used in server response

    self.i18n = new I18n({
        directory: '/i18n',
        locale: self.userLang,
        extension: '.json'
    });


    translatePage();
    fillLangInput();
    bindEvents();
    getInfoFromServer();


    function fillLangInput() {

        var langOptions = [];

        responseLanguages().forEach(function(x) {
            var selected = (x.tag === self.respLang ? ' selected' : '');
            langOptions.push(
                '<option value="' + x.tag + '"' + selected + '>'
                    + x.name +
                '</option>'
            );
        });

        $('#langInput').html(langOptions.join(''));
    }


    function bindEvents() {

        $('form').submit(function(evt) {
            evt.preventDefault();
            return false;
        });

        $('#reqButton').click(function() {
            getInfoFromServer(true);
        });

        $('#closeResultCard').click(function(){
            $('#resultCard').css('display', 'none');
        });

    }


    function translatePage() {
        $('[data-i18n]').each(function(i, el) {
            $(el).text(self.i18n.__($(el).attr('data-i18n')));
        });
    }


    // List of supported by server reponse languages
    function responseLanguages() {
        return [
            { tag: 'en',    name: 'English' },
            { tag: 'ru',    name: 'Русский (Russian)' },
            { tag: 'de',    name: 'Deutsch (German)' },
            { tag: 'es',    name: 'Español (Spanish)' },
            { tag: 'pt-BR', name: 'Español - Argentina (Spanish)' },
            { tag: 'fr',    name: 'Français (French)' },
            { tag: 'ja',    name: '日本語 (Japanese)' },
            { tag: 'zh-CN', name: '中国 (Chinese)' }
        ];
    }


    // Language reported by browser
    function getLang() {
        return navigator.languages && navigator.languages[0] // Chrome / Firefox
               || navigator.language     // All browsers
               || navigator.userLanguage // IE <= 10
               || 'en';  // default fallback
    }


    // Language used for user interface
    function getUserLang() {
        var userLang = getLang();
        for (var i = 0; i < self.translations.length; i++) {
            if (userLang === self.translations[i]) {
                return userLang;
            }
            if (userLang.slice(0, 2) === self.translations[i]) {
                return userLang.slice(0, 2);
            }
        }
        return userLang;
    }


    // Language used for selecting default response language
    function getRespLang() {

        var userLang = getLang();

        // cannot use find() in old android browsers, so using filter().
        var respLang = responseLanguages().filter(function(x) {
            return x.tag === userLang;
        });
        respLang = respLang.length > 0 ? respLang[0] : undefined;

        if (!respLang) {
            // cannot use find() in old android browsers, so using filter().
            respLang = responseLanguages().filter(function(x) {
                return x.tag === userLang.slice(0, 2);
            });
            respLang = respLang.length > 0 ? respLang[0] : undefined;
        }

        if (respLang) {
            return respLang.tag;
        }

        return 'en';
    }


    function getInfoFromServer(scrollToResult) {

        var loadingModal = $('#loadingModal');
        var resultCard = $('#resultCard');
        var resultCardHeader = $('#resultCardHeader');

        var addrInput = $('#addrInput');
        var langInput = $('#langInput');

        var url = 'http://ip-api.com/json/'
            + addrInput.val()
            + '?lang=' + langInput.val();

        var initialQuery = '';
        var tableContent = '';

        loadingModal.css('display', 'block');

        $.getJSON(url, function(result) {

            $.each(result, function(key, val) {
                if (key === 'status') {
                    if (val === 'fail') {
                        resultCardHeader.removeClass('w3-teal');
                        resultCardHeader.addClass('w3-red');
                    } else {
                        resultCardHeader.removeClass('w3-red');
                        resultCardHeader.addClass('w3-teal');
                    }
                } else {
                    tableContent +=
                    '<tr>' +
                    '<td><b>' + self.i18n.__(key) + '</b>:</td>' +
                    '<td>' + val + '</td>' +
                    '</tr>';
                    if (key === 'query') {
                        initialQuery = val;
                    }
                }
            });

            $('#resultTable').html(tableContent);

            if (!addrInput.val()) {
                addrInput.val(initialQuery);
            }

            loadingModal.css('display', 'none');
            resultCard.css('display', 'block');
            if (scrollToResult) {
                // addrInput[0].scrollIntoView();
                $('#reqButton')[0].scrollIntoView();
            }
        });
    }
});


