import VuexORM from "@vuex-orm/core";
import User from "@/models/user.model";
import Submission from "@/models/submission.model";
import Repository from "./repository.model";
import Zenodo from "./zenodo.model";
import HydroShare from "./hydroshare.model";
import External from "./external.model";
import EarthChem from "./earthchem.model";

/**
 * Register all the Models here.
 * https://vuex-orm.org/guide
 */

const db = new VuexORM.Database();

db.register(User);
db.register(Submission);
db.register(Repository);
db.register(Zenodo);
db.register(HydroShare);
db.register(EarthChem);
db.register(External);

export const orm = db;
