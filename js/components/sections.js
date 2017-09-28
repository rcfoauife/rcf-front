/**
 * TODO CW: Update this to Vue 1.0
 */
new Vue({
    el: '#sections',
    data: {
        sections: {},
        campusOptions: [],
        serviceOptionsByCampus: [],
        sectionOptionsByService: [],
        preloader: true,
        campus: '1'
    },
    ready: function (){
        this.fetchData();
    },
    watch: {
       'preloader': function() {
           $('#preloader').fadeOut();
       }
    },
    methods: {
        fetchData: function() {
            this.$http.post('actions/cotmSdk/sections/index', [], function(data, status, request) {
                this.sections = data['sections'];
                this.campusOptions = data['campusOptions'];
                this.serviceOptionsByCampus = data['serviceOptionsByCampus'];
                this.sectionOptionsByService = data['sectionOptionsByService'];
                this.preloader = false;
            }, {
                emulateJSON: true
            }).error(function() {
                this.requestCompleted = true;
            });
        },
        getServiceOptions: function(campusId) {
            return this.serviceOptionsByCampus[campusId];
        },
        getSectionOptions: function(serviceId) {
            return this.sectionOptionsByService[serviceId];
        },
        findSection: function(serviceId, sectionId) {
            var result = '';
            _.each(this.sections, _.bind(function(value, key){
                if ((sectionId == value.section) && (serviceId == value.service_id)) {
                    result = value;
                }
            }, this));
            return result;
        }
    },
    components: {
        'sections-campus': {
            data: function() {
                return {
                    service: ''
                }
            },
            ready: function() {
                this.service = this.serviceOptions[0].value;
            },
            computed: {
                image: function() {
                    switch(this.text) {
                        case 'South Campus':
                            return '/img/sections/sections-south.png';
                            break;
                        case 'Tulsa Campus':
                        case 'Central Campus':
                            return '/img/sections/sections-tulsa.png';
                            break;
                        case 'Oneighty Campus':
                        case 'Oneighty':
                            return '/img/sections/sections-oneighty.png';
                            break;
                        default:
                        return '';
                    }
                },
                active: function() {
                    return (this.$parent.campus == this.value)
                },
                serviceOptions: function() {
                    return this.$parent.serviceOptionsByCampus[this.value];
                }
            },
            methods: {
                activate: function() {
                    this.$parent.$set('campus', this.value);
                }
            },
            components: {
                'sections-service': {
                    data: function() {
                        return {
                            sections: [],
                            leaderSections: []
                        }
                    },
                    computed: {
                        active: function() {
                            return (this.$parent.service == this.value)
                        }
                    },
                    ready: function (){
                        this.fetchSections();
                    },
                    methods: {
                        fetchSections: function() {
                            var options = this.$root.getSectionOptions(this.value);
                            var result = [];
                            var existingLeaders = [];
                            _.each(options, _.bind(function(value, key){
                                var section = this.findSection(value.value);
                                if(!this.leaderSections.hasOwnProperty(section.leaders)) this.leaderSections[section.leaders] = [];
                                if (!_.contains(this.leaderSections[section.leaders], section.section)) {
                                    this.leaderSections[section.leaders].push(section.section);
                                }
                                if (!_.contains(existingLeaders, section.leaders)) {
                                    if (section.image && section.description) {
                                        existingLeaders.push(section.leaders);
                                        result.push(section);
                                    }
                                }
                            }, this));
                            this.sections = result;
                        },
                        activate: function() {
                            this.$parent.$set('service', this.value);
                        },
                        findSection: function(section) {
                            return this.$root.findSection(this.value, section);
                        }
                    },
                    components: {
                        'sections-section': {
                            data: function() {
                                return {
                                    imageLoaded: false
                                }
                            },
                            computed: {
                                leaderSections: function() {
                                    return this.$parent.leaderSections[this.leaders];
                                }
                            },
                            methods: {
                                onImageLoaded: function() {
                                    this.imageLoaded = true;
                                }
                            }
                        }
                    }
                }
            }
        },
    }
});