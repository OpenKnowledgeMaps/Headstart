const options = {
    title: "Overview of Educational Technology",
    paper_max_scale: 1,
    paper_min_scale: 1,
    bubble_max_scale: 1,
    bubble_min_scale: 1,
    input_format: "csv",
    use_area_uri: false,
    base_unit: "readers",
    is_force_areas: false,
    url_prefix: "http://mendeley.com/catalog/",
    show_timeline: false,
    show_dropdown: true,
    show_intro: false
};

const data_path = "./data/";
const data = [{
    title: "edu1",
    file: require(data_path + "educational-technology.csv")
}, {
    title: "edu2",
    file: require(data_path + "edu2.csv")
}, {
    title: "edu3",
    file: require(data_path + "edu3.csv")
}, {
    title: "edu4",
    file: require(data_path + "edu4.csv")
}, {
    title: "edu5",
    file: require(data_path + "edu5.csv")
}];

export const app_config = {
    options: options,
    data: data
};
